import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import {
  OrderStatus,
  PaymentStatus,
  VerificationStatus,
} from "../../../generated/prisma/enums.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import { RiderOrdersQuery } from "./order.types.js";
import { filterAndSortByDistance } from "./order.service.js";
import { createUserNotification } from "../../users/notification/notification.service.js";
import { markOrderDelivered } from "../../shared/order-delivery.service.js";

const ORDER_INCLUDE = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
  restaurant: {
    select: {
      id: true,
      name: true,
      addressLine: true,
      latitude: true,
      longitude: true,
    },
  },
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

const formatOrder = (order: any, includePin = false) => ({
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
  paymentStatus: order.paymentStatus,
  orderPaymentMethod: order.orderPaymentMethod || "PREPAID",
  restaurantNote: order.restaurantNote || null,
  riderNote: order.riderNote || null,
  ...(includePin && order.deliveryPin
    ? { deliveryPin: order.deliveryPin }
    : {}),
  createdAt: order.createdAt,
  user: {
    id: order.user.id.toString(),
    firstName: order.user.firstName,
    lastName: order.user.lastName,
    phone: order.user.phone,
  },
  restaurant: {
    id: order.restaurant.id.toString(),
    name: order.restaurant.name,
    address: order.restaurant.addressLine,
    latitude: order.restaurant.latitude?.toString() || null,
    longitude: order.restaurant.longitude?.toString() || null,
  },
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

// Helper: ensure rider is verified
const ensureVerified = (req: RiderAuthRequest, res: Response): boolean => {
  if (req.rider?.verificationStatus !== VerificationStatus.VERIFIED) {
    res.status(403).json({
      success: false,
      message: "Your account must be verified to manage orders.",
    });
    return false;
  }
  return true;
};

// Helper: ensure rider is online (has toggled their availability on)
const ensureOnline = (req: RiderAuthRequest, res: Response): boolean => {
  if (!req.rider?.isOnline) {
    res.status(403).json({
      success: false,
      message: "You are offline. Go online to see or accept deliveries.",
    });
    return false;
  }
  return true;
};

// 1. Get available orders (READY, no rider assigned, within 20km)
export const getAvailableOrders = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;
    if (!ensureOnline(req, res)) return;

    const { page = "1", limit = "20", latitude, longitude } =
      req.query as RiderOrdersQuery;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: "Rider location (latitude, longitude) is required.",
      });
      return;
    }

    const riderLat = parseFloat(latitude);
    const riderLon = parseFloat(longitude);

    if (isNaN(riderLat) || isNaN(riderLon)) {
      res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude.",
      });
      return;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const where = {
      status: OrderStatus.READY,
      riderId: null,
    };

    // Fetch all matching orders, then filter/sort by distance
    const allOrders = await prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
    });

    const nearbyOrders = filterAndSortByDistance(allOrders, riderLat, riderLon);
    const total = nearbyOrders.length;

    // Manual pagination after distance filtering
    const skip = (pageNum - 1) * limitNum;
    const paginatedOrders = nearbyOrders.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedOrders.map((o) => formatOrder(o)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },
);

// 2. Get rider's own orders (assigned to this rider)
export const getMyOrders = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;

    const riderId = req.riderId!;
    const {
      status,
      page = "1",
      limit = "20",
      dateFrom,
      dateTo,
    } = req.query as RiderOrdersQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      riderId: BigInt(riderId),
    };

    if (status) {
      const statuses = status.split(",").map((s) => s.trim()) as OrderStatus[];
      where.status = { in: statuses };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

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
      data: orders.map((o) => formatOrder(o, true)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },
);

// 3. Get single order detail
export const getOrderDetail = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;

    const riderId = req.riderId!;
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Rider can view available orders (READY, no rider) or their own orders
    const isAvailable =
      order.status === OrderStatus.READY && order.riderId === null;
    const isOwnOrder = order.riderId === BigInt(riderId);

    if (!isAvailable && !isOwnOrder) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: formatOrder(order, isOwnOrder) });
  },
);

// 4. Accept/claim an order (assign rider, generate delivery PIN)
export const acceptOrder = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;
    if (!ensureOnline(req, res)) return;

    const riderId = req.riderId!;
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Check if rider already has the maximum of 2 active orders
    const activeOrderCount = await prisma.order.count({
      where: {
        riderId: BigInt(riderId),
        status: {
          in: [OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP],
        },
      },
    });

    if (activeOrderCount >= 2) {
      res.status(400).json({
        success: false,
        message:
          "You already have 2 active orders. Please complete a delivery before accepting a new order.",
      });
      return;
    }

    if (order.status !== OrderStatus.READY) {
      res.status(400).json({
        success: false,
        message: `Cannot accept order with status "${order.status}". Only READY orders can be accepted.`,
      });
      return;
    }

    if (order.riderId !== null) {
      res.status(409).json({
        success: false,
        message: "This order has already been claimed by another rider.",
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: {
        riderId: BigInt(riderId),
        status: OrderStatus.RIDER_ASSIGNED,
      },
      include: ORDER_INCLUDE,
    });

    res.status(200).json({
      success: true,
      message: "Order accepted.",
      data: formatOrder(updated, true),
    });
  },
);

// 5. Pickup order (READY → PICKED_UP)
export const pickupOrder = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;

    const riderId = req.riderId!;
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (order.riderId !== BigInt(riderId)) {
      res.status(403).json({
        success: false,
        message: "This order is not assigned to you.",
      });
      return;
    }

    if (order.status !== OrderStatus.RIDER_ASSIGNED) {
      res.status(400).json({
        success: false,
        message: `Cannot pick up order with status "${order.status}". Order must be RIDER_ASSIGNED.`,
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status: OrderStatus.PICKED_UP },
      include: ORDER_INCLUDE,
    });

    // Notify the user that their order has been picked up
    await createUserNotification({
      userId: updated.userId.toString(),
      title: "Order Picked Up",
      message: `Your order #${updated.orderNumber} from ${updated.restaurant.name} has been picked up and is on its way!`,
      type: "order",
      metadata: { orderId: updated.id.toString(), status: OrderStatus.PICKED_UP },
    });

    res.status(200).json({
      success: true,
      message: "Order picked up.",
      data: formatOrder(updated, true),
    });
  },
);

// 6. Deliver order (PICKED_UP → DELIVERED, requires PIN verification)
export const deliverOrder = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    if (!ensureVerified(req, res)) return;

    const riderId = req.riderId!;
    const orderId = req.params.id as string;
    const { pin } = req.body as { pin?: string };

    if (!pin || pin.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Delivery PIN is required to confirm delivery.",
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    if (order.riderId !== BigInt(riderId)) {
      res.status(403).json({
        success: false,
        message: "This order is not assigned to you.",
      });
      return;
    }

    if (order.status !== OrderStatus.PICKED_UP) {
      res.status(400).json({
        success: false,
        message: `Cannot deliver order with status "${order.status}". Order must be PICKED_UP.`,
      });
      return;
    }

    if (order.deliveryPin !== pin.trim()) {
      res.status(400).json({
        success: false,
        message:
          "Incorrect delivery PIN. Please ask the customer for the correct PIN.",
      });
      return;
    }

    await markOrderDelivered(BigInt(orderId));

    const updated = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: ORDER_INCLUDE,
    });

    if (!updated) {
      res.status(500).json({ success: false, message: "Order disappeared after update." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order delivered.",
      data: formatOrder(updated, true),
    });
  },
);
