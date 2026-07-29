import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { PayoutMethod } from "../../../generated/prisma/enums.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
import {
  CreatePaymentDetailBody,
  UpdatePaymentDetailBody,
} from "./payment.types.js";

/**
 * Helper to get the vendor's restaurant.
 * Uses restaurantId from query/params if provided, otherwise falls back to the vendor's first restaurant.
 */
async function getVendorRestaurant(vendorId: bigint, restaurantId?: string) {
  if (restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(restaurantId) },
    });
    if (!restaurant || restaurant.vendorId !== vendorId) return null;
    return restaurant;
  }
  return prisma.restaurant.findFirst({
    where: { vendorId },
    orderBy: { createdAt: "asc" },
  });
}

export const addPaymentDetails = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      method,
      bankName,
      network,
      phone,
      accountName,
      accountNumber,
    }: CreatePaymentDetailBody = req.body;

    if (!method || !accountName) {
      res.status(400).json({
        success: false,
        message: "Payment method and account name are required",
      });
      return;
    }

    if (method === "BANK" && !accountNumber) {
      res.status(400).json({
        success: false,
        message: "Account number is required for bank payments",
      });
      return;
    }

    if (method === "MOMO" && !phone) {
      res.status(400).json({
        success: false,
        message: "Phone number is required for mobile money payments",
      });
      return;
    }

    const restaurant = await getVendorRestaurant(
      vendor.id,
      req.query.restaurantId as string
    );
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found. Please create a restaurant first.",
      });
      return;
    }

    try {
      const existingCount = await prisma.restaurantPaymentDetail.count({
        where: { restaurantId: restaurant.id },
      });

      const paymentDetail = await prisma.restaurantPaymentDetail.create({
        data: {
          restaurantId: restaurant.id,
          method: method as PayoutMethod,
          bankName: bankName || null,
          network: network || null,
          phone: phone || null,
          accountName,
          accountNumber: accountNumber || null,
          isDefault: existingCount === 0,
        },
      });

      // Mark payment info as complete on restaurant
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { isPaymentInfoComplete: true },
      });

      res.status(201).json({
        success: true,
        message: "Payment details added successfully",
        data: {
          ...paymentDetail,
          id: paymentDetail.id.toString(),
          restaurantId: paymentDetail.restaurantId.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error adding payment details:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while adding payment details.",
      });
    }
  }
);

export const getPaymentDetails = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const restaurant = await getVendorRestaurant(
      vendor.id,
      req.query.restaurantId as string
    );
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
      return;
    }

    try {
      const details = await prisma.restaurantPaymentDetail.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      });

      const response = details.map((d) => ({
        ...d,
        id: d.id.toString(),
        restaurantId: d.restaurantId.toString(),
      }));

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      console.error("Error fetching payment details:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching payment details.",
      });
    }
  }
);

export const updatePaymentDetails = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const detailId = BigInt(req.params.id as string);

    const existing = await prisma.restaurantPaymentDetail.findUnique({
      where: { id: detailId },
      include: { restaurant: { select: { vendorId: true } } },
    });

    if (!existing || existing.restaurant.vendorId !== vendor.id) {
      res.status(404).json({
        success: false,
        message: "Payment detail not found or access denied",
      });
      return;
    }

    const {
      method,
      bankName,
      network,
      phone,
      accountName,
      accountNumber,
    }: UpdatePaymentDetailBody = req.body;

    const updateData: Record<string, unknown> = {};
    if (method !== undefined) updateData.method = method as PayoutMethod;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (network !== undefined) updateData.network = network;
    if (phone !== undefined) updateData.phone = phone;
    if (accountName !== undefined) updateData.accountName = accountName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;

    try {
      const updated = await prisma.restaurantPaymentDetail.update({
        where: { id: detailId },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        message: "Payment details updated successfully",
        data: {
          ...updated,
          id: updated.id.toString(),
          restaurantId: updated.restaurantId.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error updating payment details:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating payment details.",
      });
    }
  }
);
