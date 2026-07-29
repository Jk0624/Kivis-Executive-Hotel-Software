import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./features/users/authentication/auth.routes.js";
import foodRoutes from "./features/menu/food/food.routes.js";
import restaurantRoutes from "./features/users/restaurant/restaurant.routes.js";
import addonRoutes from "./features/menu/addons/addon.routes.js";
import userAddonRoutes from "./features/menu/addons/addon.user.routes.js";
import packRoutes from "./features/menu/packs/pack.routes.js";
import orderRoutes from "./features/users/orders/order.routes.js";
import categoryRoutes from "./features/menu/categories/category.routes.js";
import paymentRoutes from "./features/users/payments/payment.routes.js";
import {
  generalLimiter,
  payForMeLimiter,
} from "./middleware/common/rateLimiter.middleware.js";
import addressRoutes from "./features/users/addresses/address.routes.js";
import notificationRoutes from "./features/users/notification/notification.router.js";
import vendorAuthRoutes from "./features/vendors/authentication/auth.routes.js";
import vendorRestaurantRoutes from "./features/vendors/restaurant/restaurant.routes.js";
import vendorPaymentRoutes from "./features/vendors/payment/payment.routes.js";
import vendorVerificationRoutes from "./features/vendors/verification/verification.routes.js";
import vendorOrderRoutes from "./features/vendors/orders/order.routes.js";
import vendorEarningsRoutes from "./features/vendors/earnings/earnings.routes.js";
import vendorNotificationRoutes from "./features/vendors/notification/notification.router.js";
import riderAuthRoutes from "./features/riders/authentication/auth.routes.js";
import riderVehicleRoutes from "./features/riders/vehicle/vehicle.routes.js";
import riderPaymentRoutes from "./features/riders/payment/payment.routes.js";
import riderVerificationRoutes from "./features/riders/verification/verification.routes.js";
import riderOrderRoutes from "./features/riders/orders/order.routes.js";
import riderEarningsRoutes from "./features/riders/earnings/earnings.routes.js";
import riderNotificationRoutes from "./features/riders/notification/notification.router.js";
import configRoutes from "./features/config/config.routes.js";
import couponRoutes from "./features/users/coupons/coupon.routes.js";
import payForMeRoutes from "./features/pay-for-me/payForMe.routes.js";
import { authenticate } from "./middleware/users/auth.middleware.js";
import { vendorAuthenticate } from "./middleware/vendors/vendorAuth.middleware.js";
import { riderAuthenticate } from "./middleware/riders/riderAuth.middleware.js";
import { adminAuthenticate } from "./middleware/admin/adminAuth.middleware.js";
import { auditAppActivity } from "./middleware/common/appAudit.middleware.js";
import { AppActorType } from "./generated/prisma/client.js";
import adminAuthRoutes from "./features/admin/authentication/auth.routes.js";
import adminUsersRoutes from "./features/admin/users/users.routes.js";
import adminVendorsRoutes from "./features/admin/vendors/vendors.routes.js";
import adminRestaurantsRoutes from "./features/admin/restaurants/restaurants.routes.js";
import adminRidersRoutes from "./features/admin/riders/riders.routes.js";
import adminOrdersRoutes from "./features/admin/orders/orders.routes.js";
import adminMenuRoutes from "./features/admin/menu/menu.routes.js";
import adminPayoutsRoutes from "./features/admin/payouts/payouts.routes.js";
import adminAnalyticsRoutes from "./features/admin/analytics/analytics.routes.js";
import adminOperationsRoutes from "./features/admin/operations/operations.routes.js";
import adminBannersRoutes from "./features/admin/banners/banners.routes.js";
import adminAdminsRoutes from "./features/admin/admins/admins.routes.js";
import adminAuditRoutes from "./features/admin/audit/audit.routes.js";
import adminCouponsRoutes from "./features/admin/coupons/coupons.routes.js";
import bannersRoutes from "./features/users/banners/banners.routes.js";

dotenv.config();

export function createApp() {
  const app = express();

  // Behind a proxy (e.g. Render) so trust X-Forwarded-* headers
  app.set("trust proxy", 1);

  // Middleware to capture raw body for webhook signature verification
  app.use(
    "/api/v1/payments/paystack/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      // Store raw body for webhook verification
      (req as any).rawBody = req.body.toString("utf8");
      // Parse JSON for easier access
      try {
        req.body = JSON.parse((req as any).rawBody);
      } catch (e) {
        // If parsing fails, keep raw body
      }
      next();
    },
  );

  // Regular middleware for other routes
  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: "*", // Allow all origins for development
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply general rate limiter to all API routes
  app.use("/api", generalLimiter);

  // Public config (no auth required) — registered under each app prefix
  app.use("/user/api/v1/config", configRoutes);
  app.use("/vendor/api/v1/config", configRoutes);
  app.use("/rider/api/v1/config", configRoutes);

  // App activity audit listeners. They write after successful authenticated
  // mutating requests and intentionally avoid raw request bodies.
  app.use("/user/api/v1", auditAppActivity(AppActorType.USER));
  app.use("/vendor/api/v1", auditAppActivity(AppActorType.VENDOR));
  app.use("/rider/api/v1", auditAppActivity(AppActorType.RIDER));

  // Routes
  app.use("/user/api/v1/auth", authRoutes);
  app.use("/user/api/v1/categories", categoryRoutes);
  app.use("/user/api/v1/foods", foodRoutes);
  app.use("/user/api/v1/restaurants", restaurantRoutes);
  app.use("/user/api/v1/addons", authenticate, userAddonRoutes);
  app.use("/user/api/v1/packs", authenticate, packRoutes);
  app.use("/user/api/v1/orders", authenticate, orderRoutes);
  app.use("/user/api/v1/payments", paymentRoutes);
  app.use("/user/api/v1/addresses", authenticate, addressRoutes);
  app.use("/user/api/v1/notifications", notificationRoutes);
  app.use("/user/api/v1/coupons", authenticate, couponRoutes);
  app.use("/user/api/v1/banners", bannersRoutes);

  // Vendor Routes
  app.use("/vendor/api/v1/auth", vendorAuthRoutes);
  app.use("/vendor/api/v1/restaurants", vendorAuthenticate, vendorRestaurantRoutes);
  app.use("/vendor/api/v1/payment-details", vendorAuthenticate, vendorPaymentRoutes);
  app.use("/vendor/api/v1/verification", vendorAuthenticate, vendorVerificationRoutes);
  app.use("/vendor/api/v1/orders", vendorAuthenticate, vendorOrderRoutes);
  app.use("/vendor/api/v1/earnings", vendorAuthenticate, vendorEarningsRoutes);
  app.use("/vendor/api/v1/notifications", vendorAuthenticate, vendorNotificationRoutes);
  app.use("/vendor/api/v1/foods", vendorAuthenticate, foodRoutes);
  app.use("/vendor/api/v1/packs", vendorAuthenticate, packRoutes);
  app.use("/vendor/api/v1/addons", vendorAuthenticate, addonRoutes);
  app.use("/vendor/api/v1/categories", vendorAuthenticate, categoryRoutes);

  // Admin Routes
  app.use("/admin/api/v1/auth", adminAuthRoutes);
  app.use("/admin/api/v1/users", adminAuthenticate, adminUsersRoutes);
  app.use("/admin/api/v1/restaurants", adminAuthenticate, adminRestaurantsRoutes);
  app.use("/admin/api/v1/vendors", adminAuthenticate, adminVendorsRoutes);
  app.use("/admin/api/v1/riders", adminAuthenticate, adminRidersRoutes);
  app.use("/admin/api/v1/orders", adminAuthenticate, adminOrdersRoutes);
  app.use("/admin/api/v1/menu", adminAuthenticate, adminMenuRoutes);
  app.use("/admin/api/v1/payouts", adminAuthenticate, adminPayoutsRoutes);
  app.use("/admin/api/v1/analytics", adminAuthenticate, adminAnalyticsRoutes);
  app.use("/admin/api/v1/operations", adminAuthenticate, adminOperationsRoutes);
  app.use("/admin/api/v1/banners", adminAuthenticate, adminBannersRoutes);
  app.use("/admin/api/v1/admins", adminAuthenticate, adminAdminsRoutes);
  app.use("/admin/api/v1/audit", adminAuthenticate, adminAuditRoutes);
  app.use("/admin/api/v1/coupons", adminAuthenticate, adminCouponsRoutes);

  // Rider Routes
  app.use("/rider/api/v1/auth", riderAuthRoutes);
  app.use("/rider/api/v1/vehicle", riderAuthenticate, riderVehicleRoutes);
  app.use("/rider/api/v1/payment-details", riderAuthenticate, riderPaymentRoutes);
  app.use("/rider/api/v1/verification", riderAuthenticate, riderVerificationRoutes);
  app.use("/rider/api/v1/orders", riderAuthenticate, riderOrderRoutes);
  app.use("/rider/api/v1/earnings", riderAuthenticate, riderEarningsRoutes);
  app.use("/rider/api/v1/notifications", riderAuthenticate, riderNotificationRoutes);

  // Public pay-for-me routes (no auth required)
  app.use("/pay", payForMeLimiter, payForMeRoutes);

  // Paystack redirects the user's browser (WebView) here after payment. No auth.
  app.get("/payment/callback", (req, res) => {
    const reference = req.query.reference;
    if (reference) console.log("[Payment] Callback hit, reference:", reference);
    res
      .status(200)
      .send(
        "<!DOCTYPE html><html><body><p>Payment received. You can close this window.</p></body></html>",
      );
  });

  //
  app.get("/", (req, res) => {
    res
      .status(200)
      .send(
        "<!DOCTYPE html><html><body><p>You can close this window.</p></body></html>",
      );
  });

  // ─── TEMP: global error handler ──────────────────────────────────────────────
  // Safe to delete this block once root causes are identified.
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const ip = req.ip || req.socket?.remoteAddress;
      if (err.type === "entity.parse.failed") {
        console.error(
          `[BadJSON] ${req.method} ${req.originalUrl} | IP: ${ip} | UA: ${req.headers["user-agent"]} | ${err.message}`,
        );
        return res.status(400).json({ error: "Invalid JSON in request body" });
      }
      console.error(
        `[Error] ${req.method} ${req.originalUrl} | IP: ${ip} |`,
        err,
      );
      res
        .status(err.status || 500)
        .json({ error: err.message || "Internal server error" });
    },
  );
  // ─── END TEMP ─────────────────────────────────────────────────────────────────

  return app;
}
