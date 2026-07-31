import crypto from "crypto";
import { Response } from "express";
import { AuthRequest } from "../../../middleware/users/auth.middleware.js";
import { isSameUser } from "../../../utils/auth.utils.js";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import {
  OrderStatus,
  OrderPaymentMethod,
  PaymentStatus,
  RestaurantStatus,
} from "../../../generated/prisma/enums.js";
import { TransactionStatus } from "../../../generated/prisma/enums.js";

const generateDeliveryPin = (): string => {
  return crypto.randomInt(1000, 9999).toString();
};

const generateOrderNumber = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CHO-${result}`;
};

import {
  CreateOrderRequestBody,
  UpdateOrderStatusRequestBody,
  OrderItemInput,
  OrderItemAddonInput,
} from "./order.types.js";
import { paystackService } from "../../../services/paystack/paystack.service.js";
import {
  loadPlatformConfig,
  calculateDeliveryFee,
} from "../../config/config.controller.js";
import { calculateBestDistance } from "../../../utils/distance.js";
import {
  validateCoupon,
  validateCouponInsideTransaction,
  reverseCouponRedemption,
  createRefundCoupon,
} from "../coupons/coupon.service.js";
import { CouponSource } from "../../../generated/prisma/enums.js";
import {
  createPayForMeLink,
  buildPayForMeUrl,
} from "../../pay-for-me/payForMe.service.js";
import { createUserNotification } from "../notification/notification.service.js";
import { createVendorNotification } from "../../vendors/notification/notification.service.js";
import { getCustomerPaymentEmail } from "../../../utils/paymentEmail.js";

// 1. Create Order
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Check if body exists
    if (!req.body) {
      res.status(400).json({
        success: false,
        message:
          "Request body is required. Make sure Content-Type is application/json",
      });
      return;
    }

    const {
      restaurantId,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      orderPaymentMethod,
      restaurantNote,
      riderNote,
      items,
      initializePayment = false,
      couponCode,
    }: CreateOrderRequestBody = req.body;

    // userId comes from the verified JWT — not trusted from the request body
    const userIdStr = req.userId!;

    // Validation
    if (!restaurantId || !deliveryAddress || !items || items.length === 0) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: restaurantId, deliveryAddress, and items are required",
      });
      return;
    }

    // Validate IDs
    const restaurantIdStr = String(restaurantId);
    if (isNaN(Number(restaurantIdStr)) || !/^\d+$/.test(restaurantIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurantId format",
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userIdStr) },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
      return;
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(restaurantIdStr) },
      include: { vendor: { select: { isActive: true } } },
    });

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Check if the owning vendor is not blocked
    if (restaurant.vendor && !restaurant.vendor.isActive) {
      res.status(400).json({
        success: false,
        message: "This restaurant is currently not available.",
      });
      return;
    }

    // Check if restaurant is accepting orders
    if (restaurant.status !== RestaurantStatus.ACTIVE) {
      res.status(400).json({
        success: false,
        message:
          "This restaurant is currently not accepting orders. Please try again later.",
      });
      return;
    }

    // Load platform config and calculate delivery fee from distance
    const platformConfig = await loadPlatformConfig();

    let deliveryFeeNum = 0;
    if (deliveryLatitude != null && deliveryLongitude != null) {
      const { distanceKm } = await calculateBestDistance(
        {
          latitude: Number(restaurant.latitude),
          longitude: Number(restaurant.longitude),
        },
        {
          latitude: Number(deliveryLatitude),
          longitude: Number(deliveryLongitude),
        },
      );
      deliveryFeeNum = await calculateDeliveryFee(distanceKm);
    }

    // Validate and process items
    const orderItems: any[] = [];
    let foodTotal = 0;

    for (const item of items) {
      const foodIdStr = String(item.foodId);
      if (isNaN(Number(foodIdStr)) || !/^\d+$/.test(foodIdStr)) {
        res.status(400).json({
          success: false,
          message: `Invalid foodId format for item: ${foodIdStr}`,
        });
        return;
      }

      if (!item.quantity || item.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: "Item quantity must be a positive number",
        });
        return;
      }

      // Get food
      const food = await prisma.food.findUnique({
        where: { id: BigInt(foodIdStr) },
        include: {
          addons: {
            where: {
              addon: {
                isActive: true,
              },
            },
            include: {
              addon: true,
            },
          },
          packs: {
            where: {
              isActive: true,
            },
          } as any,
        },
      });

      if (!food) {
        res.status(404).json({
          success: false,
          message: `Food not found: ${foodIdStr}`,
        });
        return;
      }

      // Validate food belongs to restaurant
      if (food.restaurantId.toString() !== restaurantIdStr) {
        res.status(400).json({
          success: false,
          message: `Food ${foodIdStr} does not belong to restaurant ${restaurantIdStr}`,
        });
        return;
      }

      // Validate packs and addons are mutually exclusive
      if (
        food.packs &&
        food.packs.length > 0 &&
        food.addons &&
        food.addons.length > 0
      ) {
        res.status(400).json({
          success: false,
          message: `Food ${foodIdStr} cannot have both packs and addons`,
        });
        return;
      }

      // Handle pack selection
      let foodPrice = parseFloat(food.price.toString());
      let selectedPackId: BigInt | null = null;

      if (food.packs && food.packs.length > 0) {
        // Food has packs - pack selection is required
        if (!item.foodPackId) {
          res.status(400).json({
            success: false,
            message: `Food ${foodIdStr} requires a pack selection`,
          });
          return;
        }

        const packIdStr = String(item.foodPackId);
        if (isNaN(Number(packIdStr)) || !/^\d+$/.test(packIdStr)) {
          res.status(400).json({
            success: false,
            message: `Invalid foodPackId format: ${packIdStr}`,
          });
          return;
        }

        // Find the selected pack
        const selectedPack = food.packs.find(
          (p) => p.id.toString() === packIdStr,
        );

        if (!selectedPack) {
          res.status(400).json({
            success: false,
            message: `Pack ${packIdStr} is not available for food ${foodIdStr}`,
          });
          return;
        }

        // Use pack price instead of food price
        foodPrice = parseFloat(selectedPack.price.toString());
        selectedPackId = selectedPack.id;
      } else if (item.foodPackId) {
        // Food doesn't have packs but pack was provided
        res.status(400).json({
          success: false,
          message: `Food ${foodIdStr} does not have packs`,
        });
        return;
      }

      // Validate that addons are not provided if food has packs
      if (
        food.packs &&
        food.packs.length > 0 &&
        item.addons &&
        item.addons.length > 0
      ) {
        res.status(400).json({
          success: false,
          message: `Food ${foodIdStr} has packs and cannot have addons`,
        });
        return;
      }

      // For pack-based foods, foodPrice is the pack price and gets added to total.
      // For addon-based foods, foodPrice is the minimum threshold (not added to total).
      const hasAddons = food.addons && food.addons.length > 0;
      if (!hasAddons) {
        const itemTotal = foodPrice * item.quantity;
        foodTotal += itemTotal;
      }

      // Process addons
      let addonsTotalForItem = 0;
      const itemAddons: any[] = [];
      if (item.addons && item.addons.length > 0) {
        for (const addonInput of item.addons) {
          const addonIdStr = String(addonInput.addonId);
          if (isNaN(Number(addonIdStr)) || !/^\d+$/.test(addonIdStr)) {
            res.status(400).json({
              success: false,
              message: `Invalid addonId format: ${addonIdStr}`,
            });
            return;
          }

          // Find addon in food's available addons
          const foodAddon = food.addons.find(
            (fa) => fa.addonId.toString() === addonIdStr,
          );

          if (!foodAddon) {
            res.status(400).json({
              success: false,
              message: `Addon ${addonIdStr} is not available for food ${foodIdStr}`,
            });
            return;
          }

          const addon = foodAddon.addon;
          const addonPrice = parseFloat(addon.price.toString());

          // Validate quantity
          if (addonPrice === 0 && addon.frontendComponent !== "slider") {
            // Free addon (non-slider) - quantity must be 1
            if (addonInput.quantity !== 1) {
              res.status(400).json({
                success: false,
                message: `Free addon ${addonIdStr} quantity must be 1`,
              });
              return;
            }
          } else {
            // Paid addon - validate quantity
            if (addonInput.quantity < 1) {
              res.status(400).json({
                success: false,
                message: `Addon ${addonIdStr} quantity must be at least 1`,
              });
              return;
            }

            if (
              foodAddon.maxQuantity &&
              addonInput.quantity > foodAddon.maxQuantity
            ) {
              res.status(400).json({
                success: false,
                message: `Addon ${addonIdStr} quantity cannot exceed ${foodAddon.maxQuantity}`,
              });
              return;
            }
          }

          // Calculate addon total based on frontend component type
          let addonTotal: number;
          let addonUnitPrice: number;

          // Store quantity for DB record
          let storedQuantity: number;

          if (
            addon.frontendComponent === "slider" &&
            addon.minPrice !== null &&
            addon.step !== null
          ) {
            // Slider-based addon: quantity represents steps
            // Step 0 = not selected (shouldn't be sent), Step 1 = minPrice, Step 2+ = minPrice + ((steps - 1) * step)
            const steps = addonInput.quantity;
            const minPrice = parseFloat(addon.minPrice.toString());
            const stepValue = parseFloat(addon.step.toString());

            if (steps === 1) {
              addonUnitPrice = minPrice;
            } else {
              addonUnitPrice = minPrice + (steps - 1) * stepValue;
            }
            addonTotal = addonUnitPrice;
            // Store as quantity 1 with full price so price * quantity is always correct
            storedQuantity = 1;
          } else {
            // Counter/checkbox addon: price * quantity
            addonUnitPrice = addonPrice;
            addonTotal = addonPrice * addonInput.quantity;
            storedQuantity = addonInput.quantity;
          }

          addonsTotalForItem += addonTotal;

          itemAddons.push({
            addonId: BigInt(addonIdStr),
            quantity: storedQuantity,
            price: addonUnitPrice,
          });
        }
      }

      // For addon-based foods, validate that addon total meets the minimum price (food.price)
      if (hasAddons) {
        if (addonsTotalForItem < foodPrice) {
          res.status(400).json({
            success: false,
            message: `Selected addons total (${addonsTotalForItem.toFixed(2)}) must be at least ${foodPrice.toFixed(2)} for food ${food.name}`,
          });
          return;
        }
        foodTotal += addonsTotalForItem * item.quantity;
      }

      // Validate required addon tags (only if food has addons, not packs)
      if (
        food.addons &&
        food.addons.length > 0 &&
        food.requiredAddonTags &&
        food.requiredAddonTags.length > 0
      ) {
        // Get tags that have available addons (defensive - prevents broken data from blocking orders)
        const availableTags = new Set(
          food.addons.map((fa) => fa.addon?.tag).filter(Boolean),
        );

        // Only validate required tags that have selectable addons
        const tagsToValidate = food.requiredAddonTags.filter((tag) =>
          availableTags.has(tag),
        );

        // Group selected addons by their tag
        const selectedTags = new Set<string>();
        for (const addonInput of item.addons || []) {
          const addonIdStr = String(addonInput.addonId);
          const foodAddon = food.addons.find(
            (fa) => fa.addonId.toString() === addonIdStr,
          );
          if (foodAddon && foodAddon.addon) {
            selectedTags.add(foodAddon.addon.tag);
          }
        }

        // Check if all validatable required tags have at least one selected addon
        const missingRequiredTags: string[] = [];
        for (const requiredTag of tagsToValidate) {
          if (!selectedTags.has(requiredTag)) {
            missingRequiredTags.push(requiredTag);
          }
        }

        if (missingRequiredTags.length > 0) {
          res.status(400).json({
            success: false,
            message: `At least one addon from the following tag groups is required: ${missingRequiredTags.join(", ")}`,
          });
          return;
        }
      }

      orderItems.push({
        foodId: BigInt(foodIdStr),
        quantity: item.quantity,
        price: foodPrice,
        foodPackId: selectedPackId,
        addons: itemAddons,
      });
    }

    // Compute fees from platform config
    const serviceFee =
      Math.round(
        Math.min(
          foodTotal * platformConfig.serviceFeePercent,
          platformConfig.serviceFeeCap,
        ) * 100,
      ) / 100;
    const tax = Math.round(foodTotal * platformConfig.taxRate * 100) / 100;
    let totalAmount = foodTotal + deliveryFeeNum + serviceFee + tax;
    const originalOrderTotal = totalAmount; // preserve pre-discount full order total

    // Validate coupon if provided (read-only fast-fail check, no writes yet)
    let couponDiscount = 0;
    let validatedCouponId: bigint | null = null;
    let validatedCouponSource: string | null = null;

    if (couponCode) {
      // Single validation against the full order total (food + all fees).
      // All coupon types use the full bill as the cap — this matches what the
      // /coupons/validate endpoint uses, keeping preview and order creation in sync.
      const couponResult = await validateCoupon(
        couponCode,
        BigInt(userIdStr),
        originalOrderTotal,
      );

      if (!couponResult.valid) {
        res.status(400).json({
          success: false,
          message: couponResult.message,
        });
        return;
      }

      couponDiscount = couponResult.discount;
      validatedCouponId = couponResult.couponId;
      validatedCouponSource = couponResult.source;

      totalAmount =
        Math.round((originalOrderTotal - couponDiscount) * 100) / 100;
      if (totalAmount < 0) totalAmount = 0;
    }

    // Cash on delivery limit
    const COD_MAX_AMOUNT = Number(process.env.COD_MAX_AMOUNT) || 150;
    if (
      orderPaymentMethod === OrderPaymentMethod.CASH_ON_DELIVERY &&
      totalAmount > COD_MAX_AMOUNT
    ) {
      res.status(400).json({
        success: false,
        message: `Cash on Delivery is only available for orders up to GHS ${COD_MAX_AMOUNT}.`,
      });
      return;
    }

    // Create order with items and addons in a transaction
    const order = await (prisma as any).$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: BigInt(userIdStr),
          restaurantId: BigInt(restaurantIdStr),
          status: OrderStatus.PENDING,
          totalAmount,
          foodTotal,
          serviceFee,
          tax,
          discount: couponDiscount,
          couponId: validatedCouponId,
          deliveryAddress,
          deliveryLatitude: deliveryLatitude ?? null,
          deliveryLongitude: deliveryLongitude ?? null,
          deliveryFee: deliveryFeeNum,
          restaurantNote: restaurantNote || null,
          riderNote: riderNote || null,
          orderPaymentMethod: orderPaymentMethod || OrderPaymentMethod.PREPAID,
          paymentStatus: PaymentStatus.PENDING,
          deliveryPin: generateDeliveryPin(),
          vendorCommissionRate: restaurant.platformCommission,
        },
      });

      // Generate unique order number
      let orderNumber: string;

      do {
        orderNumber = generateOrderNumber();
        const existing = await tx.order.findUnique({
          where: { orderNumber },
        });
        if (!existing) break;
      } while (true);

      await tx.order.update({
        where: { id: newOrder.id },
        data: { orderNumber },
      });

      // Create order items
      for (const item of orderItems) {
        const orderItem = await (tx as any).orderItem.create({
          data: {
            orderId: newOrder.id,
            foodId: item.foodId,
            foodPackId: item.foodPackId || null,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Create order item addons
        for (const addon of item.addons) {
          await (tx as any).orderItemAddon.create({
            data: {
              orderItemId: orderItem.id,
              addonId: addon.addonId,
              quantity: addon.quantity,
              price: addon.price,
            },
          });
        }
      }

      // Re-validate coupon inside transaction to prevent race conditions
      if (validatedCouponId && couponDiscount > 0) {
        const capAmount = originalOrderTotal; // full pre-discount order total

        const txCouponResult = await validateCouponInsideTransaction(
          tx,
          validatedCouponId,
          BigInt(userIdStr),
          capAmount,
        );

        if (!txCouponResult.valid) {
          throw new Error(txCouponResult.message);
        }

        // Use the transaction-validated discount (balance may have changed)
        couponDiscount = txCouponResult.discount;

        await tx.couponRedemption.create({
          data: {
            couponId: validatedCouponId,
            orderId: newOrder.id,
            userId: BigInt(userIdStr),
            discountAmount: couponDiscount,
          },
        });

        if (validatedCouponSource === CouponSource.REFUND) {
          await tx.coupon.update({
            where: { id: validatedCouponId },
            data: {
              balance: { decrement: couponDiscount },
            },
          });
        }

        // Update the order's discount and totalAmount with the transaction-validated values
        const newTotal = Math.max(
          Math.round(
            (totalAmount + couponDiscount - txCouponResult.discount) * 100,
          ) / 100,
          0,
        );

        // If the coupon covers the full order, mark it PAID now — no Paystack needed
        const couponFullyCovered =
          newTotal === 0 && validatedCouponId !== null && couponDiscount > 0;

        await tx.order.update({
          where: { id: newOrder.id },
          data: {
            discount: couponDiscount,
            totalAmount: newTotal,
            ...(couponFullyCovered && {
              paymentStatus: PaymentStatus.PAID,
              paidAt: new Date(),
            }),
          },
        });
      }

      return newOrder;
    });

    // Fetch complete order with relations
    const completeOrder = await (prisma as any).order.findUnique({
      where: { id: order.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            food: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
            orderItemAddons: {
              include: {
                addon: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!completeOrder) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve created order",
      });
      return;
    }

    // Convert to response format
    const orderResponse: any = {
      id: completeOrder.id.toString(),
      orderNumber: completeOrder.orderNumber,
      userId: completeOrder.userId.toString(),
      restaurantId: completeOrder.restaurantId.toString(),
      status: completeOrder.status,
      totalAmount: completeOrder.totalAmount.toString(),
      deliveryAddress: completeOrder.deliveryAddress,
      deliveryLatitude: completeOrder.deliveryLatitude?.toString() || null,
      deliveryLongitude: completeOrder.deliveryLongitude?.toString() || null,
      deliveryFee: completeOrder.deliveryFee.toString(),
      foodTotal: completeOrder.foodTotal?.toString() || "0.00",
      serviceFee: completeOrder.serviceFee?.toString() || "0.00",
      tax: completeOrder.tax?.toString() || "0.00",
      discount: completeOrder.discount?.toString() || "0.00",
      orderPaymentMethod: completeOrder.orderPaymentMethod || "PREPAID",
      paymentStatus: completeOrder.paymentStatus,
      restaurantNote: completeOrder.restaurantNote || null,
      riderNote: completeOrder.riderNote || null,
      deliveryPin: completeOrder.deliveryPin || null,
      createdAt: completeOrder.createdAt,
      updatedAt: completeOrder.updatedAt,
      restaurant: {
        id: completeOrder.restaurant.id.toString(),
        name: completeOrder.restaurant.name,
      },
      items: completeOrder.orderItems.map((item: any) => ({
        id: item.id.toString(),
        orderId: item.orderId.toString(),
        foodId: item.foodId.toString(),
        quantity: item.quantity,
        price: item.price.toString(),
        food: {
          id: item.food.id.toString(),
          name: item.food.name,
          price: item.food.price.toString(),
          imageUrl: item.food.imageUrl || null,
        },
        addons: item.orderItemAddons.map((addon: any) => ({
          id: addon.id.toString(),
          orderItemId: addon.orderItemId.toString(),
          addonId: addon.addonId.toString(),
          quantity: addon.quantity,
          price: addon.price.toString(),
          addon: {
            id: addon.addon.id.toString(),
            name: addon.addon.name,
            price: addon.addon.price.toString(),
          },
        })),
      })),
    };

    // Generate pay-for-me link if payment method is PAY_FOR_ME
    if (completeOrder.orderPaymentMethod === OrderPaymentMethod.PAY_FOR_ME) {
      try {
        const payForMeLink = await createPayForMeLink(completeOrder.id);
        orderResponse.payForMeLink = payForMeLink;
      } catch (error: any) {
        orderResponse.payForMeLinkError =
          error.message || "Failed to generate payment link";
      }
    }

    // Zero-total guard: coupon covered the full order — skip Paystack entirely.
    // Only applies when a coupon was actually used (not a free item or pricing bug).
    if (
      Number(completeOrder.totalAmount) === 0 &&
      completeOrder.couponId !== null &&
      Number(completeOrder.discount) > 0
    ) {
      await createUserNotification({
        userId: userIdStr,
        title: "Order Confirmed",
        message: `Your coupon covered your full order #${completeOrder.orderNumber}. No payment needed!`,
        type: "payment",
        metadata: { orderId: completeOrder.id.toString() },
      });

      if (restaurant.vendorId) {
        try {
          await createVendorNotification({
            vendorId: restaurant.vendorId.toString(),
            title: "New Order Received",
            message: `New order #${completeOrder.orderNumber}. Accept or reject now.`,
            type: "order",
            metadata: {
              eventType: "NEW_ORDER",
              orderId: completeOrder.id.toString(),
              restaurantId: completeOrder.restaurantId.toString(),
              occurredAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error("Failed to notify vendor for fully-paid order:", error);
        }
      }

      orderResponse.alreadyPaid = true;
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: orderResponse,
      });
      return;
    }

    // Initialize payment if requested
    if (initializePayment) {
      try {
        // Get user email
        const userWithEmail = await prisma.user.findUnique({
          where: { id: BigInt(userIdStr) },
          select: { email: true },
        });

        const customerEmail = getCustomerPaymentEmail(userWithEmail?.email);
        if (!customerEmail) {
          res.status(400).json({
            success: false,
            message: "Customer email is required for payment initialization",
          });
          return;
        }

        // Initialize Paystack transaction (callback URL from env)
        const paystackResponse = await paystackService.initializeTransaction(
          completeOrder.id.toString(),
          parseFloat(completeOrder.totalAmount.toString()),
          customerEmail,
          {
            orderId: completeOrder.id.toString(),
            userId: userIdStr,
          },
        );

        // Create transaction record
        const transaction = await (prisma as any).transaction.create({
          data: {
            orderId: completeOrder.id,
            providerReference: paystackResponse.data.reference,
            amount: completeOrder.totalAmount,
            currency: "GHS",
            status: TransactionStatus.PENDING,
            providerResponse: {
              authorization_url: paystackResponse.data.authorization_url,
              access_code: paystackResponse.data.access_code,
              reference: paystackResponse.data.reference,
            },
          },
        });

        // Add payment info to response
        orderResponse.payment = {
          authorizationUrl: (
            paystackResponse.data.authorization_url || ""
          ).trim(),
          accessCode: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
          transactionId: transaction.id.toString(),
        };
      } catch (error: any) {
        // Log error but don't fail order creation
        orderResponse.paymentError =
          error.message || "Failed to initialize payment";
      }
    }

    if (
      completeOrder.orderPaymentMethod ===
        OrderPaymentMethod.CASH_ON_DELIVERY &&
      restaurant.vendorId
    ) {
      try {
        await createVendorNotification({
          vendorId: restaurant.vendorId.toString(),
          title: "New Order Received",
          message: `New COD order #${completeOrder.orderNumber}. Accept or reject now.`,
          type: "order",
          metadata: {
            eventType: "NEW_ORDER",
            orderId: completeOrder.id.toString(),
            restaurantId: completeOrder.restaurantId.toString(),
            occurredAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Failed to notify vendor for COD order:", error);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: orderResponse,
    });
  },
);

// 2. Get All Orders
export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { restaurantId, status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Always scoped to the authenticated user
    const where: any = {
      userId: BigInt(req.userId!),
    };
    if (restaurantId) {
      where.restaurantId = BigInt(restaurantId as string);
    }
    if (status) {
      where.status = status as OrderStatus;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      (prisma as any).order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
          orderItems: {
            include: {
              food: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
              orderItemAddons: {
                include: {
                  addon: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      (prisma as any).order.count({ where }),
    ]);

    // Convert to response format
    const ordersResponse = orders.map((order: any) => ({
      id: order.id.toString(),
      userId: order.userId.toString(),
      restaurantId: order.restaurantId.toString(),
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude?.toString() || null,
      deliveryLongitude: order.deliveryLongitude?.toString() || null,
      deliveryFee: order.deliveryFee.toString(),
      foodTotal: order.foodTotal?.toString() || "0.00",
      serviceFee: order.serviceFee?.toString() || "0.00",
      tax: order.tax?.toString() || "0.00",
      discount: order.discount?.toString() || "0.00",
      orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
      paymentStatus: order.paymentStatus,
      restaurantNote: (order as any).restaurantNote || null,
      riderNote: (order as any).riderNote || null,
      deliveryPin: order.deliveryPin || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: {
        id: order.restaurant.id.toString(),
        name: order.restaurant.name,
      },
      items: order.orderItems.map((item: any) => ({
        id: item.id.toString(),
        orderId: item.orderId.toString(),
        foodId: item.foodId.toString(),
        quantity: item.quantity,
        price: item.price.toString(),
        food: {
          id: item.food.id.toString(),
          name: item.food.name,
          price: item.food.price.toString(),
          imageUrl: item.food.imageUrl || null,
        },
        addons: item.orderItemAddons.map((addon: any) => ({
          id: addon.id.toString(),
          orderItemId: addon.orderItemId.toString(),
          addonId: addon.addonId.toString(),
          quantity: addon.quantity,
          price: addon.price.toString(),
          addon: {
            id: addon.addon.id.toString(),
            name: addon.addon.name,
            price: addon.addon.price.toString(),
          },
        })),
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: ordersResponse,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  },
);

// 3. Get Single Order
export const getSingleOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
      return;
    }

    // Validate ID
    if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
      return;
    }

    // Ownership check before the expensive join query
    const orderOwner = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      select: { userId: true },
    });

    if (!orderOwner) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (!isSameUser(orderOwner.userId, req.userId!)) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
      return;
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: BigInt(id) },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        rider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            food: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
            foodPack: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            orderItemAddons: {
              include: {
                addon: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Convert to response format
    const orderResponse = {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      restaurantId: order.restaurantId.toString(),
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude?.toString() || null,
      deliveryLongitude: order.deliveryLongitude?.toString() || null,
      deliveryFee: order.deliveryFee.toString(),
      foodTotal: order.foodTotal?.toString() || "0.00",
      serviceFee: order.serviceFee?.toString() || "0.00",
      tax: order.tax?.toString() || "0.00",
      discount: order.discount?.toString() || "0.00",
      orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
      paymentStatus: order.paymentStatus,
      deliveryPin: order.deliveryPin || null,
      rider: order.rider
        ? {
            id: order.rider.id.toString(),
            firstName: order.rider.firstName,
            lastName: order.rider.lastName,
            phone: order.rider.phone,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: {
        id: order.restaurant.id.toString(),
        name: order.restaurant.name,
      },
      items: (order as any).orderItems.map((item: any) => ({
        id: item.id.toString(),
        orderId: item.orderId.toString(),
        foodId: item.foodId.toString(),
        foodPackId: item.foodPackId?.toString() || null,
        quantity: item.quantity,
        price: item.price.toString(),
        food: {
          id: item.food.id.toString(),
          name: item.food.name,
          price: item.food.price.toString(),
          imageUrl: item.food.imageUrl || null,
        },
        foodPack: item.foodPack
          ? {
              id: item.foodPack.id.toString(),
              name: item.foodPack.name,
              price: item.foodPack.price.toString(),
            }
          : null,
        addons: item.orderItemAddons.map((addon: any) => ({
          id: addon.id.toString(),
          orderItemId: addon.orderItemId.toString(),
          addonId: addon.addonId.toString(),
          quantity: addon.quantity,
          price: addon.price.toString(),
          addon: {
            id: addon.addon.id.toString(),
            name: addon.addon.name,
            price: addon.addon.price.toString(),
          },
        })),
      })),
    };

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: orderResponse,
    });
  },
);

// 4. Update Order Status
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    // Check if body exists
    if (!req.body) {
      res.status(400).json({
        success: false,
        message:
          "Request body is required. Make sure Content-Type is application/json",
      });
      return;
    }

    const { status }: UpdateOrderStatusRequestBody = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    // Validate ID
    if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
      return;
    }

    // Check if order exists
    const existingOrder = await (prisma as any).order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (!isSameUser(existingOrder.userId, req.userId!)) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
      return;
    }

    // Update order status
    const order = await (prisma as any).order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Convert to response format
    const orderResponse = {
      id: order.id.toString(),
      userId: order.userId.toString(),
      restaurantId: order.restaurantId.toString(),
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude?.toString() || null,
      deliveryLongitude: order.deliveryLongitude?.toString() || null,
      deliveryFee: order.deliveryFee.toString(),
      foodTotal: order.foodTotal?.toString() || "0.00",
      serviceFee: order.serviceFee?.toString() || "0.00",
      tax: order.tax?.toString() || "0.00",
      discount: order.discount?.toString() || "0.00",
      orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
      paymentStatus: order.paymentStatus,
      restaurantNote: (order as any).restaurantNote || null,
      riderNote: (order as any).riderNote || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: {
        id: order.restaurant.id.toString(),
        name: order.restaurant.name,
      },
    };

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: orderResponse,
    });
  },
);

// 5. Cancel Order
export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
      return;
    }

    // Validate ID
    if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
      return;
    }

    // Check if order exists
    const existingOrder = await (prisma as any).order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (!isSameUser(existingOrder.userId, req.userId!)) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
      return;
    }

    // Customer cancellation is allowed only before restaurant acceptance.
    // In this lifecycle, accepted orders are moved from PENDING -> CONFIRMED.
    if (existingOrder.status !== OrderStatus.PENDING) {
      res.status(400).json({
        success: false,
        message:
          "Order can only be cancelled before it is accepted by the restaurant",
      });
      return;
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: OrderStatus.CANCELLED },
    });

    // If this is a PAY_FOR_ME order, invalidate the payment link
    if (existingOrder.orderPaymentMethod === OrderPaymentMethod.PAY_FOR_ME) {
      await (prisma as any).payForMeLink.updateMany({
        where: { orderId: BigInt(id) },
        data: { isUsed: true },
      });
    }

    // Reverse any coupon applied to this order (restores REFUND balance and clears coupon on order)
    await reverseCouponRedemption(BigInt(id));

    // If this order was already paid, create a REFUND coupon for the charged amount (totalAmount)
    if (existingOrder.paymentStatus === PaymentStatus.PAID) {
      await createRefundCoupon(
        BigInt(id),
        existingOrder.userId,
        Number(existingOrder.totalAmount),
        existingOrder.orderNumber,
      );
    }

    // Re-fetch order with latest paymentStatus and restaurant for response
    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve cancelled order",
      });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: order.restaurantId },
      select: { vendorId: true },
    });

    // Convert to response format
    const orderResponse = {
      id: order.id.toString(),
      userId: order.userId.toString(),
      restaurantId: order.restaurantId.toString(),
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude?.toString() || null,
      deliveryLongitude: order.deliveryLongitude?.toString() || null,
      deliveryFee: order.deliveryFee.toString(),
      foodTotal: order.foodTotal?.toString() || "0.00",
      serviceFee: order.serviceFee?.toString() || "0.00",
      tax: order.tax?.toString() || "0.00",
      discount: order.discount?.toString() || "0.00",
      orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
      paymentStatus: order.paymentStatus,
      restaurantNote: (order as any).restaurantNote || null,
      riderNote: (order as any).riderNote || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: {
        id: order.restaurant.id.toString(),
        name: order.restaurant.name,
      },
    };

    if (restaurant?.vendorId) {
      try {
        await createVendorNotification({
          vendorId: restaurant.vendorId.toString(),
          title: "Order Cancelled",
          message: `Order #${order.orderNumber} has been cancelled by the customer.`,
          type: "order",
          metadata: {
            eventType: "ORDER_CANCELLED",
            orderId: order.id.toString(),
            restaurantId: order.restaurantId.toString(),
            occurredAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Failed to notify vendor on cancellation:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: orderResponse,
    });
  },
);

// 6. Get User Orders
export const getUserOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.params.userId as string;
    const { status, page = "1", limit = "20" } = req.query;

    if (!isSameUser(userId, req.userId!)) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this resource.",
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      userId: BigInt(req.userId!),
    };
    if (status) {
      where.status = status as OrderStatus;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      (prisma as any).order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
          rider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          orderItems: {
            include: {
              food: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
              foodPack: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
              orderItemAddons: {
                include: {
                  addon: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
          payForMeLink: {
            select: {
              token: true,
              expiresAt: true,
              isUsed: true,
              payerName: true,
            },
          },
        },
      }),
      (prisma as any).order.count({ where }),
    ]);

    // Convert to response format
    const ordersResponse = orders.map((order: any) => ({
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      restaurantId: order.restaurantId.toString(),
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: order.deliveryLatitude?.toString() || null,
      deliveryLongitude: order.deliveryLongitude?.toString() || null,
      deliveryFee: order.deliveryFee.toString(),
      foodTotal: order.foodTotal?.toString() || "0.00",
      serviceFee: order.serviceFee?.toString() || "0.00",
      tax: order.tax?.toString() || "0.00",
      discount: order.discount?.toString() || "0.00",
      orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
      paymentStatus: order.paymentStatus,
      deliveryPin: order.deliveryPin || null,
      payForMeLink: order.payForMeLink
        ? {
            url: buildPayForMeUrl(order.payForMeLink.token),
            token: order.payForMeLink.token,
            expiresAt: order.payForMeLink.expiresAt,
            isUsed: order.payForMeLink.isUsed,
            payerName: order.payForMeLink.payerName || null,
          }
        : null,
      rider: order.rider
        ? {
            id: order.rider.id.toString(),
            firstName: order.rider.firstName,
            lastName: order.rider.lastName,
            phone: order.rider.phone,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: {
        id: order.restaurant.id.toString(),
        name: order.restaurant.name,
      },
      items: order.orderItems.map((item: any) => ({
        id: item.id.toString(),
        orderId: item.orderId.toString(),
        foodId: item.foodId.toString(),
        foodPackId: item.foodPackId?.toString() || null,
        quantity: item.quantity,
        price: item.price.toString(),
        food: {
          id: item.food.id.toString(),
          name: item.food.name,
          price: item.food.price.toString(),
          imageUrl: item.food.imageUrl || null,
        },
        foodPack: item.foodPack
          ? {
              id: item.foodPack.id.toString(),
              name: item.foodPack.name,
              price: item.foodPack.price.toString(),
            }
          : null,
        addons: item.orderItemAddons.map((addon: any) => ({
          id: addon.id.toString(),
          orderItemId: addon.orderItemId.toString(),
          addonId: addon.addonId.toString(),
          quantity: addon.quantity,
          price: addon.price.toString(),
          addon: {
            id: addon.addon.id.toString(),
            name: addon.addon.name,
            price: addon.addon.price.toString(),
          },
        })),
      })),
    }));

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: {
        orders: ordersResponse,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  },
);
