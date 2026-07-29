import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { PayoutMethod } from "../../../generated/prisma/enums.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import {
  CreatePaymentDetailBody,
  UpdatePaymentDetailBody,
} from "./payment.types.js";

export const addPaymentDetails = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
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

    try {
      const existingCount = await prisma.riderPaymentDetail.count({
        where: { riderId: rider.id },
      });

      const paymentDetail = await prisma.riderPaymentDetail.create({
        data: {
          riderId: rider.id,
          method: method as PayoutMethod,
          bankName: bankName || null,
          network: network || null,
          phone: phone || null,
          accountName,
          accountNumber: accountNumber || null,
          isDefault: existingCount === 0,
        },
      });

      // Mark payment info as complete on rider
      await prisma.rider.update({
        where: { id: rider.id },
        data: { isPaymentInfoComplete: true },
      });

      res.status(201).json({
        success: true,
        message: "Payment details added successfully",
        data: {
          ...paymentDetail,
          id: paymentDetail.id.toString(),
          riderId: paymentDetail.riderId.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error adding payment details:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while adding payment details.",
      });
    }
  },
);

export const getPaymentDetails = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const details = await prisma.riderPaymentDetail.findMany({
        where: { riderId: rider.id },
        orderBy: { createdAt: "desc" },
      });

      const response = details.map((d) => ({
        ...d,
        id: d.id.toString(),
        riderId: d.riderId.toString(),
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
  },
);

export const updatePaymentDetails = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const detailId = BigInt(req.params.id as string);

    const existing = await prisma.riderPaymentDetail.findUnique({
      where: { id: detailId },
    });

    if (!existing || existing.riderId !== rider.id) {
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
      const updated = await prisma.riderPaymentDetail.update({
        where: { id: detailId },
        data: updateData,
      });

      // Mark payment info as complete on rider (in case it wasn't already)
      await prisma.rider.update({
        where: { id: rider.id },
        data: { isPaymentInfoComplete: true },
      });

      res.status(200).json({
        success: true,
        message: "Payment details updated successfully",
        data: {
          ...updated,
          id: updated.id.toString(),
          riderId: updated.riderId.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error updating payment details:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating payment details.",
      });
    }
  },
);
