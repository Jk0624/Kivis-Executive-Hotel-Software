import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";
import { RestaurantStatus, VerificationStatus } from "../../../generated/prisma/enums.js";
import { uploadToS3, deleteFromS3 } from "../../../utils/s3.js";

// Paginated, searchable list for the admin Restaurants page.
export const listRestaurants = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { search, status, verificationStatus, isPopular, page = "1", limit = "20" } =
    req.query as any;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status in RestaurantStatus) where.status = status;
  if (verificationStatus && verificationStatus in VerificationStatus)
    where.verificationStatus = verificationStatus;
  if (isPopular !== undefined) where.isPopular = isPopular === "true";
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { addressLine: { contains: search, mode: "insensitive" } },
      { vendor: { firstName: { contains: search, mode: "insensitive" } } },
      { vendor: { lastName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, imageUrl: true, addressLine: true,
        status: true, verificationStatus: true, isPopular: true, createdAt: true,
        vendor: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: restaurants.map((r) => ({ ...r, id: r.id.toString() })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// Lightweight {id, name} feed for dropdowns (banner targeting, etc.).
export const listRestaurantOptions = asyncHandler(async (_req: AdminAuthRequest, res: Response) => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  res.status(200).json({
    success: true,
    data: restaurants.map((r) => ({ id: r.id.toString(), name: r.name })),
  });
});

export const getRestaurant = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true, name: true, type: true, description: true,
      phone: true, email: true, addressLine: true,
      latitude: true, longitude: true, imageUrl: true,
      rating: true, status: true, isPopular: true,
      isInfoComplete: true, isPaymentInfoComplete: true,
      verificationStatus: true, platformCommission: true,
      createdAt: true, updatedAt: true,
      vendor: {
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          isActive: true, isPersonalInfoComplete: true,
        },
      },
      operatingHours: {
        select: { id: true, day: true, openingTime: true, closingTime: true, isClosed: true },
        orderBy: { day: "asc" },
      },
      paymentDetails: {
        select: {
          id: true, method: true, bankName: true, network: true,
          phone: true, accountName: true, accountNumber: true, isDefault: true,
        },
        orderBy: { isDefault: "desc" },
      },
    },
  });

  if (!restaurant) {
    res.status(404).json({ success: false, message: "Restaurant not found." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...restaurant,
      id: restaurant.id.toString(),
      // Decimal → string for stable JSON serialization
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      rating: restaurant.rating?.toString() ?? null,
      platformCommission: restaurant.platformCommission.toString(),
      vendor: restaurant.vendor
        ? { ...restaurant.vendor, id: restaurant.vendor.id.toString() }
        : null,
      operatingHours: restaurant.operatingHours.map((h) => ({ ...h, id: h.id.toString() })),
      paymentDetails: restaurant.paymentDetails.map((p) => ({ ...p, id: p.id.toString() })),
    },
  });
});

export const updateRestaurantProfile = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { type, description, name, status, isPopular, platformCommission } = req.body as {
    type?: string | null;
    description?: string | null;
    name?: string | null;
    status?: string | null;
    isPopular?: boolean | null;
    platformCommission?: number | null;
  };

  let restaurantId: bigint;
  try {
    restaurantId = BigInt(id);
  } catch {
    res.status(400).json({ success: false, message: "Invalid restaurant ID." });
    return;
  }

  const existing = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, imageUrl: true },
  });

  if (!existing) {
    res.status(404).json({ success: false, message: "Restaurant not found." });
    return;
  }

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      res.status(400).json({ success: false, message: "Restaurant name cannot be empty." });
      return;
    }
    updateData.name = trimmedName;
  }

  if (type !== undefined) updateData.type = typeof type === "string" ? type.trim() || null : null;
  if (description !== undefined) updateData.description = typeof description === "string" ? description.trim() || null : null;

  if (status !== undefined && status !== null) {
    const validStatuses = ["ACTIVE", "INACTIVE", "CLOSED", "PENDING"];
    if (!validStatuses.includes(String(status))) {
      res.status(400).json({ success: false, message: "Status must be ACTIVE, INACTIVE, CLOSED, or PENDING." });
      return;
    }
    updateData.status = status as RestaurantStatus;
  }

  if (isPopular !== undefined && isPopular !== null) {
    updateData.isPopular = Boolean(isPopular);
  }

  if (platformCommission !== undefined && platformCommission !== null) {
    const numCommission = Number(platformCommission);
    if (isNaN(numCommission) || numCommission < 0 || numCommission > 1) {
      res.status(400).json({ success: false, message: "Platform commission must be between 0 and 1." });
      return;
    }
    updateData.platformCommission = numCommission;
  }

  if (req.file) {
    updateData.imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, "restaurant");
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ success: false, message: "No changes submitted." });
    return;
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: updateData,
    select: {
      id: true, name: true, type: true, description: true,
      phone: true, email: true, addressLine: true,
      latitude: true, longitude: true, imageUrl: true,
      rating: true, status: true, isPopular: true,
      isInfoComplete: true, isPaymentInfoComplete: true,
      verificationStatus: true, platformCommission: true,
      createdAt: true, updatedAt: true,
      vendor: {
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          isActive: true, isPersonalInfoComplete: true,
        },
      },
      operatingHours: {
        select: { id: true, day: true, openingTime: true, closingTime: true, isClosed: true },
        orderBy: { day: "asc" },
      },
      paymentDetails: {
        select: {
          id: true, method: true, bankName: true, network: true,
          phone: true, accountName: true, accountNumber: true, isDefault: true,
        },
        orderBy: { isDefault: "desc" },
      },
    },
  });

  if (req.file && existing.imageUrl) {
    deleteFromS3(existing.imageUrl).catch(() => {});
  }

  await logAdminAction({
    adminId: req.adminId!,
    action: "UPDATE_RESTAURANT_PROFILE",
    targetType: "restaurant",
    targetId: id,
    meta: { changed: Object.keys(updateData) },
  });

  res.status(200).json({
    success: true,
    message: "Restaurant profile updated.",
    data: {
      ...restaurant,
      id: restaurant.id.toString(),
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      rating: restaurant.rating?.toString() ?? null,
      platformCommission: restaurant.platformCommission.toString(),
      vendor: restaurant.vendor
        ? { ...restaurant.vendor, id: restaurant.vendor.id.toString() }
        : null,
      operatingHours: restaurant.operatingHours.map((h) => ({ ...h, id: h.id.toString() })),
      paymentDetails: restaurant.paymentDetails.map((p) => ({ ...p, id: p.id.toString() })),
    },
  });
});
