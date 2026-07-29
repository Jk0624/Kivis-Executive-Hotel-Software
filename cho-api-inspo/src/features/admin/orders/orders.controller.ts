import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";
import { OrderStatus, PaymentStatus, VerificationStatus } from "../../../generated/prisma/enums.js";
import { reverseCouponRedemption, createRefundCoupon } from "../../users/coupons/coupon.service.js";
import { createUserNotification } from "../../users/notification/notification.service.js";
import { createRiderNotification } from "../../riders/notification/notification.service.js";
import { markOrderDelivered } from "../../shared/order-delivery.service.js";
import { startOfDayUTC, endOfDayUTC } from "../../../utils/dateRange.js";

// Statuses that count toward a rider's current workload — anything they've
// accepted but not yet delivered. Drives the load badges in the picker.
const ACTIVE_RIDER_STATUSES = [OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP] as const;

/**
 * Payment guard: returns `null` if the order may safely advance, or an
 * error message if not. COD orders are allowed to move forward unpaid —
 * payment is collected on delivery and `markOrderDelivered` auto-marks
 * the order paid at that point. Everything else (PREPAID, PAY_FOR_ME)
 * must be PAID before we commit kitchen or rider resources.
 */
function paymentBlockReason(order: { orderPaymentMethod: string; paymentStatus: string }): string | null {
  if (order.orderPaymentMethod === "CASH_ON_DELIVERY") return null;
  if (order.paymentStatus === PaymentStatus.PAID) return null;
  return `Customer hasn't paid yet. Mark the order as paid first, or cancel it.`;
}

const ORDER_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true, phone: true } },
  restaurant: { select: { id: true, name: true, addressLine: true, latitude: true, longitude: true } },
  rider: { select: { id: true, firstName: true, lastName: true, phone: true } },
  orderItems: {
    include: {
      food: { select: { id: true, name: true, price: true } },
      foodPack: { select: { id: true, name: true, price: true } },
      orderItemAddons: {
        include: { addon: { select: { id: true, name: true, price: true } } },
      },
    },
  },
} as const;

const formatOrder = (order: any) => ({
  id: order.id.toString(),
  orderNumber: order.orderNumber || null,
  status: order.status,
  totalAmount: Number(order.totalAmount).toFixed(2),
  deliveryAddress: order.deliveryAddress,
  deliveryFee: Number(order.deliveryFee).toFixed(2),
  foodTotal: Number(order.foodTotal ?? 0).toFixed(2),
  serviceFee: Number(order.serviceFee ?? 0).toFixed(2),
  tax: Number(order.tax ?? 0).toFixed(2),
  discount: Number(order.discount ?? 0).toFixed(2),
  paymentStatus: order.paymentStatus,
  orderPaymentMethod: order.orderPaymentMethod,
  adminDispatchedById: order.adminDispatchedById?.toString() ?? null,
  restaurantNote: order.restaurantNote ?? null,
  riderNote: order.riderNote ?? null,
  createdAt: order.createdAt,
  user: order.user ? { ...order.user, id: order.user.id.toString() } : null,
  restaurant: order.restaurant ? {
    ...order.restaurant,
    id: order.restaurant.id.toString(),
    latitude: order.restaurant.latitude?.toString() || null,
    longitude: order.restaurant.longitude?.toString() || null,
  } : null,
  rider: order.rider ? { ...order.rider, id: order.rider.id.toString() } : null,
  items: order.orderItems.map((item: any) => ({
    id: item.id.toString(),
    foodId: item.foodId.toString(),
    quantity: item.quantity,
    price: Number(item.price).toFixed(2),
    food: { id: item.food.id.toString(), name: item.food.name, price: Number(item.food.price).toFixed(2) },
    foodPack: item.foodPack ? { id: item.foodPack.id.toString(), name: item.foodPack.name, price: Number(item.foodPack.price).toFixed(2) } : null,
    addons: item.orderItemAddons.map((oia: any) => ({
      id: oia.id.toString(), addonId: oia.addonId.toString(),
      quantity: oia.quantity, price: Number(oia.price).toFixed(2),
      addon: { id: oia.addon.id.toString(), name: oia.addon.name, price: Number(oia.addon.price).toFixed(2) },
    })),
  })),
});

// ─── List orders (all, filterable) ───────────────────────────────────────────

export const listOrders = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const {
    search, status, paymentStatus, restaurantId, riderId, userId,
    dateFrom, dateTo, page = "1", limit = "20",
  } = req.query as any;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) {
    // Order number is a short unique varchar — prefix match is plenty here.
    where.orderNumber = { contains: (search as string).trim(), mode: "insensitive" };
  }
  if (status) where.status = { in: (status as string).split(",").map((s: string) => s.trim()) };
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (restaurantId) where.restaurantId = BigInt(restaurantId);
  if (riderId) where.riderId = BigInt(riderId);
  if (userId) where.userId = BigInt(userId);
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = startOfDayUTC(dateFrom);
    if (dateTo) where.createdAt.lte = endOfDayUTC(dateTo);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: limitNum, orderBy: { createdAt: "desc" }, include: ORDER_INCLUDE }),
    prisma.order.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: orders.map(formatOrder),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// ─── Get one order (full detail) ─────────────────────────────────────────────

export const getOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const identifier = req.params.id as string;

  // Polymorphic lookup: pure digits → numeric id (legacy/internal links);
  // anything else → order number (the human-shareable identifier).
  const isNumericId = /^\d+$/.test(identifier);
  const order = isNumericId
    ? await prisma.order.findUnique({ where: { id: BigInt(identifier) }, include: ORDER_INCLUDE })
    : await prisma.order.findUnique({ where: { orderNumber: identifier }, include: ORDER_INCLUDE });

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  res.status(200).json({ success: true, data: formatOrder(order) });
});

// ─── Act on behalf of restaurant ─────────────────────────────────────────────

export const adminAcceptOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status !== OrderStatus.PENDING) {
    res.status(400).json({ success: false, message: `Only PENDING orders can be accepted (current: ${order.status}).` });
    return;
  }

  const blocked = paymentBlockReason(order);
  if (blocked) {
    res.status(400).json({ success: false, message: blocked });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { status: OrderStatus.CONFIRMED },
    include: ORDER_INCLUDE,
  });

  await Promise.all([
    logAdminAction({ adminId: req.adminId!, action: "ORDER_ACCEPT", targetType: "order", targetId: id }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Accepted",
      message: `Your order #${order.orderNumber} has been accepted and will be prepared shortly.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.CONFIRMED },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order accepted.", data: formatOrder(updated) });
});

export const adminPrepareOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status !== OrderStatus.CONFIRMED) {
    res.status(400).json({ success: false, message: `Only CONFIRMED orders can be prepared (current: ${order.status}).` });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { status: OrderStatus.PREPARING },
    include: ORDER_INCLUDE,
  });

  await Promise.all([
    logAdminAction({ adminId: req.adminId!, action: "ORDER_PREPARE", targetType: "order", targetId: id }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Being Prepared",
      message: `Your order #${order.orderNumber} is now being prepared.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.PREPARING },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order marked as preparing.", data: formatOrder(updated) });
});

export const adminMarkReady = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status !== OrderStatus.PREPARING) {
    res.status(400).json({ success: false, message: `Only PREPARING orders can be marked ready (current: ${order.status}).` });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { status: OrderStatus.READY },
    include: ORDER_INCLUDE,
  });

  await Promise.all([
    logAdminAction({ adminId: req.adminId!, action: "ORDER_READY", targetType: "order", targetId: id }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Ready",
      message: `Your order #${order.orderNumber} is ready and waiting for a rider.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.READY },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order marked as ready.", data: formatOrder(updated) });
});

/**
 * Cancel an order at any non-terminal stage. Replaces the old PENDING-only
 * `/reject` endpoint — the dispute-resolution reality is that we need to be
 * able to cancel later in the flow (vendor can't prepare, rider unresponsive,
 * customer dispute, etc.).
 *
 * Reason is required and audit-logged. Refund coupon is issued for paid
 * orders. If a rider is currently on it, they're notified so they don't
 * keep working a cancelled order.
 */
const MIN_CANCEL_REASON = 10;

export const adminCancelOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body as { reason?: string };

  const trimmedReason = reason?.trim() ?? "";
  if (trimmedReason.length < MIN_CANCEL_REASON) {
    res.status(400).json({
      success: false,
      message: `A reason of at least ${MIN_CANCEL_REASON} characters is required to cancel.`,
    });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
    res.status(400).json({
      success: false,
      message: `Cannot cancel an order in ${order.status} state. Use override to roll back if needed.`,
    });
    return;
  }

  const previousStatus = order.status;
  const cancelled = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { status: OrderStatus.CANCELLED },
    include: ORDER_INCLUDE,
  });

  // Reverse any applied coupon and issue refund coupon for paid orders
  await reverseCouponRedemption(BigInt(id));
  if (order.paymentStatus === PaymentStatus.PAID) {
    await createRefundCoupon(order.id, order.userId, Number(order.totalAmount), order.orderNumber);
  }

  const refundNote = order.paymentStatus === PaymentStatus.PAID
    ? " A refund coupon has been issued to your account."
    : "";

  const tasks: Promise<unknown>[] = [
    logAdminAction({
      adminId: req.adminId!, action: "ORDER_CANCEL",
      targetType: "order", targetId: id,
      meta: { reason: trimmedReason, previousStatus },
    }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Cancelled",
      message: `Your order #${order.orderNumber} has been cancelled.${refundNote}`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.CANCELLED },
    }),
  ];
  // Notify rider if they were on it — otherwise they may keep working an
  // order that no longer exists from the customer's perspective.
  if (order.riderId) {
    tasks.push(createRiderNotification({
      riderId: order.riderId.toString(),
      title: "Order Cancelled",
      message: `Order #${order.orderNumber} has been cancelled and is no longer assigned to you.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.CANCELLED },
    }));
  }
  await Promise.all(tasks);

  res.status(200).json({ success: true, message: "Order cancelled.", data: formatOrder(cancelled) });
});

// ─── Admin dispatch (act as rider) ───────────────────────────────────────────

export const adminDispatchOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.adminId!;

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status !== OrderStatus.READY) {
    res.status(400).json({ success: false, message: `Only READY orders can be dispatched (current: ${order.status}).` });
    return;
  }

  if (order.riderId !== null) {
    res.status(409).json({ success: false, message: "Order is already assigned to a rider." });
    return;
  }

  const blocked = paymentBlockReason(order);
  if (blocked) {
    res.status(400).json({ success: false, message: blocked });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: {
      status: OrderStatus.RIDER_ASSIGNED,
      adminDispatchedById: BigInt(adminId),
    },
    include: ORDER_INCLUDE,
  });

  await Promise.all([
    logAdminAction({ adminId, action: "ADMIN_DISPATCH", targetType: "order", targetId: id }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Rider Assigned",
      message: `A rider has been assigned to your order #${order.orderNumber} and is on the way.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.RIDER_ASSIGNED },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order dispatched by admin.", data: formatOrder(updated) });
});

export const adminPickupOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.adminId!;

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.adminDispatchedById?.toString() !== adminId) {
    res.status(403).json({ success: false, message: "This order is not dispatched by you." });
    return;
  }

  if (order.status !== OrderStatus.RIDER_ASSIGNED) {
    res.status(400).json({ success: false, message: `Order must be RIDER_ASSIGNED to pick up (current: ${order.status}).` });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { status: OrderStatus.PICKED_UP },
    include: ORDER_INCLUDE,
  });

  await Promise.all([
    logAdminAction({ adminId, action: "ADMIN_PICKUP", targetType: "order", targetId: id }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Picked Up",
      message: `Your order #${order.orderNumber} has been picked up and is on its way!`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.PICKED_UP },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order picked up.", data: formatOrder(updated) });
});

export const adminDeliverOrder = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { pin } = req.body as { pin?: string };
  const adminId = req.adminId!;

  if (!pin?.trim()) {
    res.status(400).json({ success: false, message: "Delivery PIN is required." });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.adminDispatchedById?.toString() !== adminId) {
    res.status(403).json({ success: false, message: "This order is not dispatched by you." });
    return;
  }

  if (order.status !== OrderStatus.PICKED_UP) {
    res.status(400).json({ success: false, message: `Order must be PICKED_UP to deliver (current: ${order.status}).` });
    return;
  }

  if (order.deliveryPin !== pin.trim()) {
    res.status(400).json({ success: false, message: "Incorrect delivery PIN." });
    return;
  }

  // Admin dispatch: 100% delivery fee to platform — no rider earning record
  const deliveryFee = Number(order.deliveryFee);

  await markOrderDelivered(BigInt(id));

  const updated = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: ORDER_INCLUDE,
  });

  if (!updated) {
    res.status(500).json({ success: false, message: "Order disappeared after update." });
    return;
  }

  await Promise.all([
    logAdminAction({
      adminId,
      action: "ADMIN_DELIVER",
      targetType: "order",
      targetId: id,
      meta: { deliveryFee, platformEarning: deliveryFee, riderEarning: 0 },
    }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Delivered",
      message: `Your order #${order.orderNumber} has been delivered. Enjoy!`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.DELIVERED },
    }),
  ]);

  res.status(200).json({ success: true, message: "Order delivered.", data: formatOrder(updated) });
});

// ─── Assign rider (M44a) ─────────────────────────────────────────────────────

/**
 * Eligible-rider picker. Defaults to active + verified riders only; pass
 * `?includeAll=true` to widen the pool (e.g., for rare reassignment to a
 * rider whose verification lapsed mid-shift). Active-deliveries count is a
 * single Prisma `_count` with a filtered relation — no N+1.
 */
export const listEligibleRiders = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { search, includeAll, limit = "20" } = req.query as any;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  const where: any = {};
  if (includeAll !== "true") {
    where.isActive = true;
    where.verificationStatus = VerificationStatus.VERIFIED;
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const riders = await prisma.rider.findMany({
    where,
    take: limitNum,
    // Online first, then lightest load, then newest. The admin almost always
    // wants an available rider near the top.
    orderBy: [{ isOnline: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, firstName: true, lastName: true, phone: true,
      isActive: true, isOnline: true, verificationStatus: true,
      _count: { select: { orders: { where: { status: { in: [...ACTIVE_RIDER_STATUSES] } } } } },
    },
  });

  res.status(200).json({
    success: true,
    data: riders.map((r) => ({
      id: r.id.toString(),
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone,
      isActive: r.isActive,
      isOnline: r.isOnline,
      verificationStatus: r.verificationStatus,
      activeDeliveries: r._count.orders,
    })),
  });
});

/**
 * Assigns or reassigns a real rider to an order. Allowed from READY (first
 * assignment) and from RIDER_ASSIGNED (swap). Mutually exclusive with admin
 * dispatch — assigning a rider here clears `adminDispatchedById` and the
 * invariant "exactly one of riderId/adminDispatchedById is set in
 * RIDER_ASSIGNED+" is preserved.
 *
 * Both rider (newly assigned + previous if any) and customer are notified.
 */
export const assignRider = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { riderId } = req.body as { riderId?: string };
  const adminId = req.adminId!;

  if (!riderId) {
    res.status(400).json({ success: false, message: "riderId is required." });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status !== OrderStatus.READY && order.status !== OrderStatus.RIDER_ASSIGNED) {
    res.status(400).json({
      success: false,
      message: `Cannot assign a rider when order is ${order.status}. Order must be READY or RIDER_ASSIGNED.`,
    });
    return;
  }

  const rider = await prisma.rider.findUnique({
    where: { id: BigInt(riderId) },
    select: { id: true, firstName: true, lastName: true, isActive: true, verificationStatus: true },
  });
  if (!rider) { res.status(404).json({ success: false, message: "Rider not found." }); return; }
  if (!rider.isActive) {
    res.status(400).json({ success: false, message: "Rider is blocked. Unblock them first." });
    return;
  }
  if (rider.verificationStatus !== VerificationStatus.VERIFIED) {
    res.status(400).json({ success: false, message: "Rider is not verified." });
    return;
  }

  const blocked = paymentBlockReason(order);
  if (blocked) {
    res.status(400).json({ success: false, message: blocked });
    return;
  }

  const previousRiderId = order.riderId?.toString() ?? null;
  const isReassignment = !!previousRiderId && previousRiderId !== riderId;

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: {
      riderId: BigInt(riderId),
      adminDispatchedById: null,
      status: OrderStatus.RIDER_ASSIGNED,
    },
    include: ORDER_INCLUDE,
  });

  // Audit + notifications in parallel; push failures are swallowed inside the
  // notification services so one bad token can't break the assignment.
  const tasks: Promise<unknown>[] = [
    logAdminAction({
      adminId, action: isReassignment ? "ORDER_REASSIGN_RIDER" : "ORDER_ASSIGN_RIDER",
      targetType: "order", targetId: id,
      meta: { riderId, previousRiderId },
    }),
    createRiderNotification({
      riderId,
      title: "New Delivery Assigned",
      message: `You've been assigned order #${order.orderNumber}. Head to the restaurant to pick it up.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.RIDER_ASSIGNED },
    }),
    createUserNotification({
      userId: order.userId.toString(),
      title: isReassignment ? "Rider Updated" : "Rider Assigned",
      message: isReassignment
        ? `Order #${order.orderNumber} has been reassigned to ${rider.firstName} ${rider.lastName}.`
        : `${rider.firstName} ${rider.lastName} has been assigned to order #${order.orderNumber} and is on the way.`,
      type: "order",
      metadata: { orderId: id, status: OrderStatus.RIDER_ASSIGNED },
    }),
  ];
  // Tell the previous rider their assignment was lifted — avoids them showing
  // up at the restaurant for an order that's no longer theirs.
  if (isReassignment && previousRiderId) {
    tasks.push(createRiderNotification({
      riderId: previousRiderId,
      title: "Assignment Removed",
      message: `Order #${order.orderNumber} has been reassigned to another rider.`,
      type: "order",
      metadata: { orderId: id },
    }));
  }
  await Promise.all(tasks);

  res.status(200).json({
    success: true,
    message: isReassignment ? "Rider reassigned." : "Rider assigned.",
    data: formatOrder(updated),
  });
});

// ─── Mark as paid (M44b) ─────────────────────────────────────────────────────

/**
 * Manually mark an order's payment as received — for offline payments,
 * dispute reconciliation, or finance corrections. Allowed only when the
 * order is currently PENDING payment; admins should use override or refund
 * flows for already-paid, failed, or refunded orders.
 *
 * Method, reference, and reason are persisted in the audit log so finance
 * can reconcile against external receipts.
 */
const PAYMENT_METHODS = ["cash", "bank_transfer", "mobile_money", "other"] as const;
type ManualPaymentMethod = (typeof PAYMENT_METHODS)[number];
const MIN_MARK_PAID_REASON = 10;

export const adminMarkOrderPaid = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { method, reference, reason } = req.body as {
    method?: ManualPaymentMethod; reference?: string; reason?: string;
  };

  if (!method || !PAYMENT_METHODS.includes(method)) {
    res.status(400).json({
      success: false,
      message: `method must be one of: ${PAYMENT_METHODS.join(", ")}.`,
    });
    return;
  }
  const trimmedReason = reason?.trim() ?? "";
  if (trimmedReason.length < MIN_MARK_PAID_REASON) {
    res.status(400).json({
      success: false,
      message: `A reason of at least ${MIN_MARK_PAID_REASON} characters is required.`,
    });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.paymentStatus !== PaymentStatus.PENDING) {
    res.status(400).json({
      success: false,
      message: `Order payment is already ${order.paymentStatus}. Cannot mark paid.`,
    });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
    include: ORDER_INCLUDE,
  });

  await logAdminAction({
    adminId: req.adminId!, action: "ORDER_MARK_PAID",
    targetType: "order", targetId: id,
    meta: { method, reference: reference?.trim() || null, reason: trimmedReason },
  });

  res.status(200).json({ success: true, message: "Order marked as paid.", data: formatOrder(updated) });
});

// ─── Override status (M44b — SUPER_ADMIN escape hatch) ──────────────────────

/**
 * SUPER_ADMIN-only force-set of the order status. Last resort for dispute
 * resolution — most reversals should use cancel + reassign instead. Reason
 * is required and longer than for routine actions because each call is a
 * deviation from the documented state machine.
 *
 * Invariants enforced:
 *  - Target post-pickup states require either a rider or an admin
 *    dispatcher (otherwise we'd land in RIDER_ASSIGNED with no one
 *    responsible). When rolling back to pre-RIDER_ASSIGNED, both are
 *    cleared so the order is genuinely back in restaurant-handling land.
 *  - Non-COD, unpaid orders cannot be force-advanced past READY.
 *
 * Customer notifications use neutral copy ("status updated to X") — no
 * apologetic language; admins handle context manually in the support thread.
 */
const POST_PICKUP: OrderStatus[] = [OrderStatus.PICKED_UP, OrderStatus.DELIVERED];
const RIDER_OR_LATER: OrderStatus[] = [
  OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.DELIVERED,
];
const MIN_OVERRIDE_REASON = 15;

function overrideNotificationCopy(
  orderNumber: string | null, fromStatus: OrderStatus, toStatus: OrderStatus,
): string {
  const tag = orderNumber ? `#${orderNumber}` : "your order";
  if (fromStatus === OrderStatus.DELIVERED && toStatus === OrderStatus.PICKED_UP) {
    return `Order ${tag} status updated: it's still out for delivery.`;
  }
  if (fromStatus === OrderStatus.CANCELLED) {
    return `Order ${tag} has been reinstated and is now ${toStatus}.`;
  }
  return `Order ${tag} status updated to ${toStatus}.`;
}

export const adminOverrideOrderStatus = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, reason } = req.body as { status?: OrderStatus; reason?: string };

  const validStatuses = Object.values(OrderStatus) as OrderStatus[];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(", ")}.` });
    return;
  }
  const trimmedReason = reason?.trim() ?? "";
  if (trimmedReason.length < MIN_OVERRIDE_REASON) {
    res.status(400).json({
      success: false,
      message: `A reason of at least ${MIN_OVERRIDE_REASON} characters is required for overrides.`,
    });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(id) } });
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  if (order.status === status) {
    res.status(400).json({ success: false, message: `Order is already ${status}.` });
    return;
  }

  // Post-pickup states need an established deliverer (either real rider or
  // admin dispatcher). Force-jumping into them with no one on the order
  // would violate the assignment invariant.
  const needsDeliverer = POST_PICKUP.includes(status);
  if (needsDeliverer && !order.riderId && !order.adminDispatchedById) {
    res.status(400).json({
      success: false,
      message: `Cannot set status to ${status} — assign a rider (or yourself) first.`,
    });
    return;
  }
  // Non-COD orders must be paid before reaching rider hand-off in any path.
  if (RIDER_OR_LATER.includes(status)) {
    const blocked = paymentBlockReason(order);
    if (blocked) {
      res.status(400).json({ success: false, message: blocked });
      return;
    }
  }

  // Rolling fully back: clear assignments, delivery snapshots, PIN. Keeps
  // the order in a clean state ready to be re-routed.
  const rollsToPreRider = !RIDER_OR_LATER.includes(status);
  const updated = await prisma.order.update({
    where: { id: BigInt(id) },
    data: {
      status,
      ...(rollsToPreRider && { riderId: null, adminDispatchedById: null }),
      ...(status !== OrderStatus.DELIVERED && { deliveredAt: null }),
    },
    include: ORDER_INCLUDE,
  });

  const previousStatus = order.status;
  await Promise.all([
    logAdminAction({
      adminId: req.adminId!, action: "ORDER_OVERRIDE_STATUS",
      targetType: "order", targetId: id,
      meta: { from: previousStatus, to: status, reason: trimmedReason },
    }),
    createUserNotification({
      userId: order.userId.toString(),
      title: "Order Updated",
      message: overrideNotificationCopy(order.orderNumber, previousStatus, status),
      type: "order",
      metadata: { orderId: id, status, override: true },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: `Order status overridden to ${status}.`,
    data: formatOrder(updated),
  });
});
