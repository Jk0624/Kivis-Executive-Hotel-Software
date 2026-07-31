import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AuthRequest } from "../../../middleware/users/auth.middleware.js";
import {
  AddAddressRequestBody,
  UpdateAddressRequestBody,
} from "./address.types.js";

// 1. Get All Addresses for User
export const getAllAddresses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    const addresses = await prisma.userAddress.findMany({
      where: { userId: BigInt(userId!) },
      orderBy: { createdAt: "desc" },
    });

    const response = addresses.map((addr) => ({
      ...addr,
      id: addr.id.toString(),
      userId: addr.userId.toString(),
      latitude: Number(addr.latitude),
      longitude: Number(addr.longitude),
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  }
);

// 2. Add New Address
export const addAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const {
      label,
      addressLine,
      latitude,
      longitude,
      isDefault,
    }: AddAddressRequestBody = req.body;

    if (!addressLine || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: "addressLine, latitude, and longitude are required",
      });
      return;
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: BigInt(userId!) },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId: BigInt(userId!),
        label: label || "Home",
        addressLine,
        latitude,
        longitude,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: {
        ...address,
        id: address.id.toString(),
        userId: address.userId.toString(),
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
      },
    });
  }
);

// 3. Update Address
export const updateAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const addressId = req.params.id as string;
    const {
      label,
      addressLine,
      latitude,
      longitude,
      isDefault,
    }: UpdateAddressRequestBody = req.body;

    // Verify ownership
    const existing = await prisma.userAddress.findFirst({
      where: {
        id: BigInt(addressId),
        userId: BigInt(userId!),
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: BigInt(userId!) },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.userAddress.update({
      where: { id: BigInt(addressId) },
      data: {
        label,
        addressLine,
        latitude,
        longitude,
        isDefault,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: {
        ...updated,
        id: updated.id.toString(),
        userId: updated.userId.toString(),
        latitude: Number(updated.latitude),
        longitude: Number(updated.longitude),
      },
    });
  }
);

// 4. Delete Address
export const deleteAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const addressId = req.params.id as string;

    // Verify ownership
    const existing = await prisma.userAddress.findFirst({
      where: {
        id: BigInt(addressId),
        userId: BigInt(userId!),
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    await prisma.userAddress.delete({
      where: { id: BigInt(addressId) },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  }
);
