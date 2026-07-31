import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../prisma.js";
import { TransactionStatus } from "../../generated/prisma/enums.js";
import { paystackService } from "../../services/paystack/paystack.service.js";
import {
  findPayForMeLinkByToken,
  validatePayForMeLink,
  buildPayForMeUrl,
} from "./payForMe.service.js";
import {
  verifyAndProcessPayment,
  checkExistingTransaction,
} from "../users/payments/paymentProcessing.js";
import type { PayForMeInitializeBody } from "./payForMe.types.js";

/**
 * GET /pay/:token — Return order data as JSON for the cho-pay frontend
 */
export const renderPayForMePage = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token as string;

    const link = await findPayForMeLinkByToken(token);
    const validation = validatePayForMeLink(link);

    if (!validation.valid) {
      res.status(200).json({
        success: false,
        error: { title: validation.title, message: validation.reason },
      });
      return;
    }

    const order = link.order;
    const items = order.orderItems.map((item: any) => ({
      name: item.foodPack
        ? `${item.food.name} (${item.foodPack.name})`
        : item.food.name,
      quantity: item.quantity,
      price: parseFloat(item.price).toFixed(2),
    }));

    const subtotal = parseFloat(
      (order.foodTotal ?? order.totalAmount ?? 0).toString(),
    );
    const deliveryFee = parseFloat((order.deliveryFee ?? 0).toString());
    const serviceFee = parseFloat((order.serviceFee ?? 0).toString());
    const tax = parseFloat((order.tax ?? 0).toString());
    const discountRaw = parseFloat((order.discount ?? 0).toString());

    res.status(200).json({
      success: true,
      data: {
        restaurantName: order.restaurant.name,
        orderNumber: order.orderNumber,
        items,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        tax: tax.toFixed(2),
        discount: discountRaw > 0 ? discountRaw.toFixed(2) : undefined,
        totalAmount: parseFloat(order.totalAmount).toFixed(2),
        token,
      },
    });
  },
);

/**
 * POST /pay/:token/initialize — Initialize Paystack payment for payer.
 * Checks for existing pending/successful transactions before creating a new one.
 */
export const initializePayForMePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token as string;
    const { payerName, payerEmail, payerPhone }: PayForMeInitializeBody =
      req.body;

    if (!payerName || !payerEmail) {
      res.status(400).json({
        success: false,
        error: {
          title: "Missing Information",
          message: "Name and email are required to proceed with payment.",
        },
      });
      return;
    }

    const link = await findPayForMeLinkByToken(token);
    const validation = validatePayForMeLink(link);

    if (!validation.valid) {
      res.status(200).json({
        success: false,
        error: { title: validation.title, message: validation.reason },
      });
      return;
    }

    const order = link.order;

    // Save payer info
    await (prisma as any).payForMeLink.update({
      where: { id: link.id },
      data: {
        payerName,
        payerEmail,
        ...(payerPhone ? { payerPhone } : {}),
      },
    });

    // Check for existing transaction before creating a new one
    const existing = await checkExistingTransaction(order.id);

    if (existing.action === "already_paid") {
      res.status(200).json({
        success: false,
        error: {
          title: "Already Paid",
          message: "This order has already been paid for. Thank you!",
        },
      });
      return;
    }

    if (existing.action === "reuse") {
      // Reuse the existing Paystack payment page
      res.status(200).json({
        success: true,
        data: {
          authorizationUrl: existing.authorizationUrl,
          reference: existing.reference,
        },
      });
      return;
    }

    // Create new transaction
    try {
      const callbackUrl = buildPayForMeUrl(token) + "/callback";

      const paystackResponse = await paystackService.initializeTransaction(
        order.id.toString(),
        parseFloat(order.totalAmount.toString()),
        payerEmail,
        {
          orderId: order.id.toString(),
          userId: order.userId.toString(),
          payForMeToken: token,
          payerName,
        },
        callbackUrl,
      );

      await (prisma as any).transaction.create({
        data: {
          orderId: order.id,
          providerReference: paystackResponse.data.reference,
          amount: order.totalAmount,
          currency: "GHS",
          status: TransactionStatus.PENDING,
          providerResponse: {
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code,
            reference: paystackResponse.data.reference,
          },
          metadata: {
            payForMeToken: token,
            payerName,
            payerEmail,
          },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          authorizationUrl: paystackResponse.data.authorization_url,
          reference: paystackResponse.data.reference,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          title: "Payment Failed",
          message:
            error.message || "Failed to initialize payment. Please try again.",
        },
      });
    }
  },
);

/**
 * GET /pay/:token/callback — Paystack redirects payer here after payment.
 * Uses shared verifyAndProcessPayment — no duplicated logic.
 */
export const payForMeCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token as string;
    const reference = req.query.reference as string;

    const link = await findPayForMeLinkByToken(token);
    if (!link) {
      res.status(200).json({
        success: false,
        error: {
          title: "Link Not Found",
          message: "This payment link does not exist.",
        },
      });
      return;
    }

    if (!reference) {
      res.status(200).json({
        success: true,
        data: { status: "processing" },
      });
      return;
    }

    const result = await verifyAndProcessPayment(reference);

    res.status(200).json({
      success: true,
      data: { status: result.status === "already_paid" ? "success" : result.status },
    });
  },
);

/**
 * GET /pay/:token/status — JSON endpoint for payment status polling
 */
export const getPayForMeStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token as string;

    const link = await (prisma as any).payForMeLink.findUnique({
      where: { token },
      include: {
        order: {
          select: {
            paymentStatus: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Payment link not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: link.order.paymentStatus,
        orderNumber: link.order.orderNumber,
        totalAmount: link.order.totalAmount.toString(),
      },
    });
  },
);
