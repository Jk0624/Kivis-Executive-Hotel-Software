import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import {
  OrderPaymentMethod,
  OrderStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
import { VendorOrdersQuery } from "./order.types.js";
import { createUserNotification } from "../../users/notification/notification.service.js";
import { cancelPendingOrder } from "./order.service.js";
import { ORDER_EXPIRY_MS } from "../../../config/order.js";

const ORDER_INCLUDE = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      // avatar: true,
    },
  },
  restaurant: {
    select: {
      platformCommission: true,
    },
  },
  // payment fields are returned for vendor UI and payment-aware actions
  orderItems: {
    include: {
      food: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
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
} as const;

function getOrderExpiresAt(order: {
  status: string;
  orderPaymentMethod: string | null;
  createdAt: Date;
  paidAt: Date | null;
}): string | null {
  if (order.status !== OrderStatus.PENDING) return null;
  const acceptableFrom =
    order.orderPaymentMethod === OrderPaymentMethod.CASH_ON_DELIVERY
      ? order.createdAt
      : order.paidAt;
  if (!acceptableFrom) return null;
  return new Date(acceptableFrom.getTime() + ORDER_EXPIRY_MS).toISOString();
}

const formatOrder = (order: any) => ({
  id: order.id.toString(),
  orderNumber: order.orderNumber || null,
  status: order.status,
  totalAmount: Number(order.totalAmount).toFixed(2),
  deliveryAddress: order.deliveryAddress,
  deliveryLatitude: order.deliveryLatitude?.toString() || null,
  deliveryLongitude: order.deliveryLongitude?.toString() || null,
  deliveryFee: Number(order.deliveryFee).toFixed(2),
  foodTotal: Number(order.foodTotal ?? 0).toFixed(2),
  serviceFee: Number(order.serviceFee ?? 0).toFixed(2),
  tax: Number(order.tax ?? 0).toFixed(2),
  discount: Number(order.discount ?? 0).toFixed(2),
  orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
  paymentStatus: order.paymentStatus,
  restaurantNote: order.restaurantNote || null,
  riderNote: order.riderNote || null,
  platformCommission: order.restaurant?.platformCommission?.toString() || "0",
  createdAt: order.createdAt,
  expiresAt: getOrderExpiresAt(order),
  // updatedAt: not displayed anywhere
  user: {
    id: order.user.id.toString(),
    firstName: order.user.firstName,
    lastName: order.user.lastName,
    // avatar: order.user.avatar,
  },
  // restaurant: not needed — vendor IS the restaurant
  items: order.orderItems.map((item: any) => ({
    id: item.id.toString(),
    foodId: item.foodId.toString(),
    quantity: item.quantity,
    price: Number(item.price).toFixed(2),
    food: {
      id: item.food.id.toString(),
      name: item.food.name,
      imageUrl: item.food.imageUrl,
      price: Number(item.food.price).toFixed(2),
    },
    foodPack: item.foodPack
      ? {
          id: item.foodPack.id.toString(),
          name: item.foodPack.name,
          price: Number(item.foodPack.price).toFixed(2),
        }
      : null,
    addons: item.orderItemAddons.map((oia: any) => ({
      id: oia.id.toString(),
      addonId: oia.addonId.toString(),
      quantity: oia.quantity,
      price: Number(oia.price).toFixed(2),
      addon: {
        id: oia.addon.id.toString(),
        name: oia.addon.name,
        price: Number(oia.addon.price).toFixed(2),
      },
    })),
  })),
});

// Helper: get all restaurant IDs owned by vendor
const getVendorRestaurantIds = async (vendorId: string): Promise<bigint[]> => {
  const restaurants = await prisma.restaurant.findMany({
    where: { vendorId: BigInt(vendorId) },
    select: { id: true },
  });
  return restaurants.map((r) => r.id);
};

// 1. Get all orders for vendor's restaurants
export const getVendorOrders = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const {
      status,
      restaurantId,
      page = "1",
      limit = "20",
      dateFrom,
      dateTo,
    } = req.query as VendorOrdersQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
      return;
    }

    // Build where clause
    const where: any = {
      restaurantId: { in: restaurantIds },
    };

    // Filter by specific restaurant if provided
    if (restaurantId) {
      const rid = BigInt(restaurantId);
      if (!restaurantIds.some((id) => id === rid)) {
        res.status(403).json({
          success: false,
          message: "Restaurant does not belong to you.",
        });
        return;
      }
      where.restaurantId = rid;
    }

    // Filter by status (supports comma-separated values)
    if (status) {
      const statuses = status.split(",").map((s) => s.trim()) as OrderStatus[];
      where.status = { in: statuses };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Payment visibility gate:
    // - COD orders can be worked on before payment
    // - All non-COD orders must be PAID to be visible to vendor
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { orderPaymentMethod: OrderPaymentMethod.CASH_ON_DELIVERY },
          { paymentStatus: PaymentStatus.PAID },
        ],
      },
    ];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orders.map(formatOrder),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },
);

// 2. Get single order detail
export const getVendorOrder = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const orderId = req.params.id as string;
    const restaurantIds = await getVendorRestaurantIds(vendorId);

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }
    if (!restaurantIds.some((id) => id === order.restaurantId)) {
      res.status(403).json({
        success: false,
        message: "This order does not belong to your restaurant.",
      });
      return;
    }

    res.status(200).json({ success: true, data: formatOrder(order) });
  },
);

// 3. Accept order (PENDING → CONFIRMED)
export const acceptOrder = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const orderId = req.params.id as string;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: { restaurant: { select: { name: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (!restaurantIds.some((id) => id === order.restaurantId)) {
      res.status(403).json({
        success: false,
        message: "This order does not belong to your restaurant.",
      });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Cannot accept order with status "${order.status}". Only PENDING orders can be accepted.`,
      });
      return;
    }

    // Extra safety: non-COD orders must be paid before acceptance.
    if (
      order.orderPaymentMethod !== OrderPaymentMethod.CASH_ON_DELIVERY &&
      order.paymentStatus !== PaymentStatus.PAID
    ) {
      res.status(400).json({
        success: false,
        message:
          "Cannot accept this order until payment is completed for non-Cash on Delivery methods.",
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status: OrderStatus.CONFIRMED },
      include: ORDER_INCLUDE,
    });

    // Notify the user that their order has been accepted
    await createUserNotification({
      userId: order.userId.toString(),
      title: "Order Accepted",
      message: `Your order #${order.orderNumber} from ${order.restaurant.name} has been accepted and will be prepared shortly.`,
      type: "order",
      metadata: { orderId: order.id.toString(), status: OrderStatus.CONFIRMED },
    });

    res.status(200).json({
      success: true,
      message: "Order accepted.",
      data: formatOrder(updated),
    });
  },
);

// 4. Reject order (PENDING → CANCELLED)
export const rejectOrder = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const orderId = req.params.id as string;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: { restaurant: { select: { name: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (!restaurantIds.some((id) => id === order.restaurantId)) {
      res.status(403).json({
        success: false,
        message: "This order does not belong to your restaurant.",
      });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Cannot reject order with status "${order.status}". Only PENDING orders can be rejected.`,
      });
      return;
    }

    await cancelPendingOrder(BigInt(orderId), "vendor");

    // Reload order with user + items for vendor view
    const updated = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: ORDER_INCLUDE,
    });

    if (!updated) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve rejected order.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order rejected.",
      data: formatOrder(updated),
    });
  },
);

// 5. Mark order ready (CONFIRMED/PREPARING → READY)
export const markOrderReady = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const orderId = req.params.id as string;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: { restaurant: { select: { name: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (!restaurantIds.some((id) => id === order.restaurantId)) {
      res.status(403).json({
        success: false,
        message: "This order does not belong to your restaurant.",
      });
      return;
    }

    const validStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
    ];
    if (!validStatuses.includes(order.status as OrderStatus)) {
      res.status(400).json({
        success: false,
        message: `Cannot mark order as ready with status "${order.status}". Order must be CONFIRMED or PREPARING.`,
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status: OrderStatus.READY },
      include: ORDER_INCLUDE,
    });

    // Notify the user that their order is ready for pickup
    await createUserNotification({
      userId: order.userId.toString(),
      title: "Order Ready",
      message: `Your order #${order.orderNumber} from ${order.restaurant.name} is ready for pickup! A rider will be assigned shortly.`,
      type: "order",
      metadata: { orderId: order.id.toString(), status: OrderStatus.READY },
    });

    res.status(200).json({
      success: true,
      message: "Order marked as ready for pickup.",
      data: formatOrder(updated),
    });
  },
);

// 6. Start preparing order (CONFIRMED → PREPARING)
export const startPreparingOrder = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const orderId = req.params.id as string;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (!restaurantIds.some((id) => id === order.restaurantId)) {
      res.status(403).json({
        success: false,
        message: "This order does not belong to your restaurant.",
      });
      return;
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      res.status(400).json({
        success: false,
        message: `Cannot start preparing order with status "${order.status}". Only CONFIRMED orders can be moved to PREPARING.`,
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status: OrderStatus.PREPARING },
      include: ORDER_INCLUDE,
    });

    res.status(200).json({
      success: true,
      message: "Order is now being prepared.",
      data: formatOrder(updated),
    });
  },
);
