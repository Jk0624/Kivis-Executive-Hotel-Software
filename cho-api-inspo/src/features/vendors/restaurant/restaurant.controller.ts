import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { DayOfWeek, RestaurantStatus, VerificationStatus } from "../../../generated/prisma/enums.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
import {
  CreateRestaurantBody,
  UpdateRestaurantBody,
  OperatingHourInput,
} from "./restaurant.types.js";
import { uploadToS3, deleteFromS3 } from "../../../utils/s3.js";

export const createRestaurant = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      name,
      type,
      description,
      phone,
      email,
      addressLine,
      latitude,
      longitude,
    }: CreateRestaurantBody = req.body;

    if (!name || !addressLine || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: "Name, address, latitude, and longitude are required",
      });
      return;
    }

    const lat = parseFloat(String(latitude));
    const lng = parseFloat(String(longitude));
    if (isNaN(lat) || lat < -90 || lat > 90) {
      res.status(400).json({ success: false, message: "Invalid latitude" });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      res.status(400).json({ success: false, message: "Invalid longitude" });
      return;
    }

    try {
      const finalImageUrl = req.file
        ? await uploadToS3(req.file.buffer, req.file.originalname, "restaurant")
        : null;

      const restaurant = await prisma.restaurant.create({
        data: {
          vendorId: vendor.id,
          name,
          type: type || null,
          description: description || null,
          phone: phone || null,
          email: email || null,
          addressLine,
          latitude: lat,
          longitude: lng,
          imageUrl: finalImageUrl,
          status: RestaurantStatus.PENDING,
          isInfoComplete: true,
        },
        include: { operatingHours: true },
      });

      const restaurantResponse = {
        ...restaurant,
        id: restaurant.id.toString(),
        vendorId: restaurant.vendorId?.toString() || null,
        latitude: Number(restaurant.latitude),
        longitude: Number(restaurant.longitude),
        rating: Number(restaurant.rating),
        operatingHours: restaurant.operatingHours.map((h) => ({
          ...h,
          id: h.id.toString(),
          restaurantId: h.restaurantId.toString(),
        })),
      };

      res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        data: restaurantResponse,
      });
    } catch (error: any) {
      console.error("Error creating restaurant:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while creating the restaurant.",
      });
    }
  }
);

export const updateRestaurant = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const restaurantId = BigInt(req.params.id as string);

    const existing = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existing || existing.vendorId !== vendor.id) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found or access denied",
      });
      return;
    }

    const {
      name,
      type,
      description,
      phone,
      email,
      addressLine,
      latitude,
      longitude,
      status,
    }: UpdateRestaurantBody = req.body;

    const isLocked =
      existing.verificationStatus === VerificationStatus.UNDER_REVIEW ||
      existing.verificationStatus === VerificationStatus.VERIFIED;

    if (isLocked && name !== undefined) {
      res.status(403).json({
        success: false,
        message: "Restaurant name cannot be changed while under review or after verification.",
      });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (addressLine !== undefined) updateData.addressLine = addressLine;
    if (latitude !== undefined) updateData.latitude = parseFloat(String(latitude));
    if (longitude !== undefined) updateData.longitude = parseFloat(String(longitude));
    if (req.file) {
      const oldImageUrl = existing.imageUrl;
      updateData.imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, "restaurant");
      if (oldImageUrl) await deleteFromS3(oldImageUrl);
    }
    if (status !== undefined) {
      const allowed = [RestaurantStatus.ACTIVE, RestaurantStatus.INACTIVE] as string[];
      if (!allowed.includes(status)) {
        res.status(400).json({
          success: false,
          message: "Vendors can only set status to ACTIVE or INACTIVE",
        });
        return;
      }
      if (status === RestaurantStatus.ACTIVE && existing.verificationStatus !== "VERIFIED") {
        res.status(400).json({
          success: false,
          message: "Restaurant must be verified before it can be set to ACTIVE",
        });
        return;
      }
      updateData.status = status as RestaurantStatus;
    }

    try {
      const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: updateData,
        include: { operatingHours: true },
      });

      const restaurantResponse = {
        ...restaurant,
        id: restaurant.id.toString(),
        vendorId: restaurant.vendorId?.toString() || null,
        latitude: Number(restaurant.latitude),
        longitude: Number(restaurant.longitude),
        rating: Number(restaurant.rating),
        operatingHours: restaurant.operatingHours.map((h) => ({
          ...h,
          id: h.id.toString(),
          restaurantId: h.restaurantId.toString(),
        })),
      };

      res.status(200).json({
        success: true,
        message: "Restaurant updated successfully",
        data: restaurantResponse,
      });
    } catch (error: any) {
      console.error("[DEBUG] updateRestaurant failed:", {
        message: error.message,
        code: error.code,
        name: error.name,
        prismaMeta: error.meta,
        updateData,
        restaurantId: restaurantId.toString(),
        stack: error.stack?.split("\n").slice(0, 4).join(" | "),
      });
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the restaurant.",
      });
    }
  }
);

export const getMyRestaurants = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const restaurants = await prisma.restaurant.findMany({
        where: { vendorId: vendor.id },
        include: { operatingHours: true },
        orderBy: { createdAt: "desc" },
      });

      const response = restaurants.map((r) => ({
        ...r,
        id: r.id.toString(),
        vendorId: r.vendorId?.toString() || null,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        rating: Number(r.rating),
        operatingHours: r.operatingHours.map((h) => ({
          ...h,
          id: h.id.toString(),
          restaurantId: h.restaurantId.toString(),
        })),
      }));

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      console.error("Error fetching restaurants:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching restaurants.",
      });
    }
  }
);

export const setOperatingHours = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const restaurantId = BigInt(req.params.id as string);
    const { hours }: { hours: OperatingHourInput[] } = req.body;

    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      res.status(400).json({
        success: false,
        message: "Operating hours array is required",
      });
      return;
    }

    const existing = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existing || existing.vendorId !== vendor.id) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found or access denied",
      });
      return;
    }

    try {
      const validDays = Object.values(DayOfWeek);

      for (const hour of hours) {
        if (!validDays.includes(hour.day as DayOfWeek)) {
          res.status(400).json({
            success: false,
            message: `Invalid day: ${hour.day}. Must be one of: ${validDays.join(", ")}`,
          });
          return;
        }

        await prisma.operatingHour.upsert({
          where: {
            restaurantId_day: {
              restaurantId,
              day: hour.day as DayOfWeek,
            },
          },
          create: {
            restaurantId,
            day: hour.day as DayOfWeek,
            openingTime: hour.openingTime,
            closingTime: hour.closingTime,
            isClosed: hour.isClosed || false,
          },
          update: {
            openingTime: hour.openingTime,
            closingTime: hour.closingTime,
            isClosed: hour.isClosed || false,
          },
        });
      }

      const updatedHours = await prisma.operatingHour.findMany({
        where: { restaurantId },
        orderBy: { day: "asc" },
      });

      const response = updatedHours.map((h) => ({
        ...h,
        id: h.id.toString(),
        restaurantId: h.restaurantId.toString(),
      }));

      res.status(200).json({
        success: true,
        message: "Operating hours updated successfully",
        data: response,
      });
    } catch (error: any) {
      console.error("[DEBUG] setOperatingHours failed:", {
        message: error.message,
        code: error.code,
        name: error.name,
        prismaMeta: error.meta,
        restaurantId: restaurantId.toString(),
        hoursReceived: hours,
        stack: error.stack?.split("\n").slice(0, 4).join(" | "),
      });
      res.status(500).json({
        success: false,
        message: "An error occurred while setting operating hours.",
      });
    }
  }
);
