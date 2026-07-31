import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import {
  PaymentStatus,
  TransactionStatus,
  OrderPaymentMethod,
} from "../../../generated/prisma/enums.js";
import { paystackService } from "../../../services/paystack/paystack.service.js";
import { InitializePaymentRequestBody } from "./payment.types.js";
import {
  findPayForMeLinkByOrderId,
  regeneratePayForMeLinkToken,
  buildPayForMeUrl,
} from "../../pay-for-me/payForMe.service.js";
import {
  verifyAndProcessPayment,
  processPaymentSuccess,
  processPaymentFailure,
  checkExistingTransaction,
} from "./paymentProcessing.js";
import { getCustomerPaymentEmail } from "../../../utils/paymentEmail.js";

// Initialize payment for an order
export const initializePayment = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).json({
        success: false,
        message:
          "Request body is required. Make sure Content-Type is application/json",
      });
      return;
    }

    const { orderId }: InitializePaymentRequestBody = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    // Validate orderId format
    const orderIdStr = String(orderId);
    if (isNaN(Number(orderIdStr)) || !/^\d+$/.test(orderIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid orderId format",
      });
      return;
    }

    // Get order with user
    const order = await (prisma as any).order.findUnique({
      where: { id: BigInt(orderIdStr) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
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

    // Check for existing transaction before creating a new one
    const existing = await checkExistingTransaction(order.id);

    if (existing.action === "already_paid") {
      res.status(200).json({
        success: true,
        message: "Order is already paid",
        data: {
          alreadyPaid: true,
          orderId: orderIdStr,
        },
      });
      return;
    }

    if (existing.action === "reuse") {
      res.status(200).json({
        success: true,
        message: "Payment already initialized",
        data: {
          authorizationUrl: existing.authorizationUrl,
          reference: existing.reference,
          orderId: orderIdStr,
        },
      });
      return;
    }

    const customerEmail = getCustomerPaymentEmail(order.user.email);
    if (!customerEmail) {
      res.status(400).json({
        success: false,
        message: "Customer email is required for payment",
      });
      return;
    }

    try {
      // Initialize Paystack transaction (callback URL from env)
      const paystackResponse = await paystackService.initializeTransaction(
        orderIdStr,
        parseFloat(order.totalAmount.toString()),
        customerEmail,
        {
          orderId: orderIdStr,
          userId: order.userId.toString(),
        },
      );

      // Create transaction record
      const transaction = await (prisma as any).transaction.create({
        data: {
          orderId: BigInt(orderIdStr),
          providerReference: paystackResponse.data.reference,
          amount: order.totalAmount,
          currency: "GHS",
          status: TransactionStatus.PENDING,
          providerResponse: {
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code,
            reference: paystackResponse.data.reference,
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        data: {
          authorizationUrl: (
            paystackResponse.data.authorization_url || ""
          ).trim(),
          accessCode: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
          orderId: orderIdStr,
          transactionId: transaction.id.toString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to initialize payment",
      });
    }
  },
);

// Handle Paystack webhook
export const handlePaystackWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["x-paystack-signature"] as string;

    if (!signature) {
      res.status(400).json({
        success: false,
        message: "Missing x-paystack-signature header",
      });
      return;
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
      return;
    }

    try {
      const event = paystackService.parseWebhookEvent(req.body);

      // Find transaction by reference
      const transaction = await (prisma as any).transaction.findUnique({
        where: { providerReference: event.data.reference },
        include: { order: true },
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
        return;
      }

      // Idempotency: already processed
      if (
        transaction.status === TransactionStatus.SUCCESS ||
        transaction.status === TransactionStatus.FAILED
      ) {
        res.status(200).json({
          success: true,
          message: "Webhook already processed",
        });
        return;
      }

      const providerData = {
        status: event.data.status,
        amount: event.data.amount,
        channel: event.data.channel,
        paid_at: event.data.paid_at,
      };

      if (paystackService.isSuccessfulPayment(event)) {
        await processPaymentSuccess(transaction, providerData);
      } else if (paystackService.isFailedPayment(event)) {
        await processPaymentFailure(transaction, providerData);
      }

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process webhook",
      });
    }
  },
);

// Verify payment status by reference — uses shared verifyAndProcessPayment
export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const reference = req.params.reference as string;

    if (!reference) {
      res.status(400).json({
        success: false,
        message: "Reference is required",
      });
      return;
    }

    try {
      // Find transaction for response data
      const transaction = await (prisma as any).transaction.findUnique({
        where: { providerReference: reference },
        include: { order: true },
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
        return;
      }

      // Use shared verify & process logic
      const result = await verifyAndProcessPayment(reference);
      const status =
        result.status === "already_paid" ? "success" : result.status;

      // Reload transaction to get updated provider response
      const updated = await (prisma as any).transaction.findUnique({
        where: { id: transaction.id },
      });
      const cached = updated.providerResponse as any;

      res.status(200).json({
        success: true,
        message: "Payment verification successful",
        data: {
          reference: updated.providerReference,
          status,
          amount: cached?.amount
            ? cached.amount / 100
            : parseFloat(updated.amount.toString()),
          currency: updated.currency,
          paidAt: cached?.paid_at || null,
          orderId: transaction.orderId.toString(),
          transactionId: transaction.id.toString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to verify payment",
      });
    }
  },
);

// Get pay-for-me link details for an order
export const getPayForMeLink = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    if (!orderId || isNaN(Number(orderId)) || !/^\d+$/.test(orderId)) {
      res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
      return;
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.orderPaymentMethod !== OrderPaymentMethod.PAY_FOR_ME) {
      res.status(400).json({
        success: false,
        message: "This order does not use Pay for Me",
      });
      return;
    }

    const link = await findPayForMeLinkByOrderId(BigInt(orderId));

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Payment link not found for this order",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        url: buildPayForMeUrl(link.token),
        token: link.token,
        expiresAt: link.expiresAt.toISOString(),
        isUsed: link.isUsed,
        payerName: link.payerName,
        payerEmail: link.payerEmail,
      },
    });
  },
);

// Regenerate pay-for-me link for an order
export const regeneratePayForMeLinkEndpoint = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    if (!orderId || isNaN(Number(orderId)) || !/^\d+$/.test(orderId)) {
      res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
      return;
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.orderPaymentMethod !== OrderPaymentMethod.PAY_FOR_ME) {
      res.status(400).json({
        success: false,
        message: "This order does not use Pay for Me",
      });
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
      return;
    }

    try {
      const link = await regeneratePayForMeLinkToken(BigInt(orderId));

      res.status(200).json({
        success: true,
        message: "Payment link regenerated successfully",
        data: link,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to regenerate payment link",
      });
    }
  },
);

// Check payment status by orderId — verifies with Paystack if pending
export const checkPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    if (!orderId || isNaN(Number(orderId)) || !/^\d+$/.test(orderId)) {
      res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
      return;
    }

    const result = await checkExistingTransaction(BigInt(orderId));

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: result.action === "already_paid" ? "PAID" : "PENDING",
      },
    });
  },
);
