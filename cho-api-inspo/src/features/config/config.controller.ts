import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../prisma.js";
import { calculateBestDistance } from "../../utils/distance.js";

/** Load the singleton platform config row. Reusable by other modules. */
export const loadPlatformConfig = async () => {
  const config = await prisma.platformConfig.findUnique({ where: { id: 1 } });
  if (!config)
    throw new Error(
      "Platform config not found. Please seed the platform_config table.",
    );
  return {
    serviceFeePercent: Number(config.serviceFeePercent),
    serviceFeeCap: Number(config.serviceFeeCap),
    taxRate: Number(config.taxRate),
    riderDeliveryFeePercent: Number(config.riderDeliveryFeePercent),
  };
};

/** Look up delivery fee by distance from the delivery_fee_tiers table. */
export const calculateDeliveryFee = async (
  distanceKm: number,
): Promise<number> => {
  const tier = await prisma.deliveryFeeTier.findFirst({
    where: { maxDistanceKm: { gte: distanceKm } },
    orderBy: { maxDistanceKm: "asc" },
  });

  if (tier) return Number(tier.fee);

  // Distance exceeds all tiers – use the highest tier fee
  const maxTier = await prisma.deliveryFeeTier.findFirst({
    orderBy: { maxDistanceKm: "desc" },
  });

  return maxTier ? Number(maxTier.fee) : 0;
};

// GET /api/v1/config
export const getPlatformConfig = asyncHandler(
  async (_req: Request, res: Response) => {
    const config = await loadPlatformConfig();
    const tiers = await prisma.deliveryFeeTier.findMany({
      orderBy: { maxDistanceKm: "asc" },
    });

    res.status(200).json({
      success: true,
      data: {
        serviceFeePercent: config.serviceFeePercent,
        serviceFeeCap: config.serviceFeeCap,
        taxRate: config.taxRate,
        riderDeliveryFeePercent: config.riderDeliveryFeePercent,
        deliveryFeeTiers: tiers.map((t) => ({
          maxDistanceKm: Number(t.maxDistanceKm),
          fee: Number(t.fee),
        })),
      },
    });
  },
);

// GET /api/v1/config/delivery-fee?restaurantId=X&lat=Y&lng=Z
export const getDeliveryFeeEstimate = asyncHandler(
  async (req: Request, res: Response) => {
    const { restaurantId, lat, lng } = req.query as {
      restaurantId?: string;
      lat?: string;
      lng?: string;
    };

    if (!restaurantId || !lat || !lng) {
      res.status(400).json({
        success: false,
        message: "restaurantId, lat, and lng are required",
      });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(restaurantId) },
      select: { latitude: true, longitude: true },
    });

    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }

    const { distanceKm, source: distanceSource } = await calculateBestDistance(
      {
        latitude: Number(restaurant.latitude),
        longitude: Number(restaurant.longitude),
      },
      {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
    );

    const fee = await calculateDeliveryFee(distanceKm);

    res.status(200).json({
      success: true,
      data: {
        distanceKm: Math.round(distanceKm * 100) / 100,
        deliveryFee: fee,
      },
    });
  },
);

// GET /api/v1/config/test-distance?originLat=A&originLng=B&destinationLat=C&destinationLng=D
export const testBestDistance = asyncHandler(
  async (req: Request, res: Response) => {
    const { originLat, originLng, destinationLat, destinationLng } =
      req.body as {
        originLat?: string;
        originLng?: string;
        destinationLat?: string;
        destinationLng?: string;
      };

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      res.status(400).json({
        success: false,
        message:
          "originLat, originLng, destinationLat, and destinationLng are required",
      });
      return;
    }

    const coordinates = [
      Number(originLat),
      Number(originLng),
      Number(destinationLat),
      Number(destinationLng),
    ];

    if (coordinates.some((value) => !Number.isFinite(value))) {
      res.status(400).json({
        success: false,
        message: "All coordinates must be valid numbers",
      });
      return;
    }

    const [
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
    ] = coordinates;

    const result = await calculateBestDistance(
      {
        latitude: originLatitude,
        longitude: originLongitude,
      },
      {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        distanceKm: Math.round(result.distanceKm * 100) / 100,
        distanceSource: result.source,
      },
    });
  },
);

// GET /api/v1/config/app-version?platform=android&app=user
export const getAppVersion = asyncHandler(
  async (req: Request, res: Response) => {
    const { platform, app } = req.query as {
      platform?: string;
      app?: string;
    };

    if (!platform || !app) {
      res.status(400).json({
        success: false,
        message: "platform and app query parameters are required",
      });
      return;
    }

    const validApps = ["user", "rider", "vendor"];
    const validPlatforms = ["ios", "android"];

    if (!validApps.includes(app) || !validPlatforms.includes(platform)) {
      res.status(400).json({
        success: false,
        message: "Invalid app or platform value",
      });
      return;
    }

    const version = await prisma.appVersion.findUnique({
      where: { app_platform: { app, platform } },
    });

    if (!version) {
      res.status(404).json({
        success: false,
        message: "Version info not found for this app/platform",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        latestVersion: version.latestVersion,
        minimumVersion: version.minimumVersion,
        storeUrl: version.storeUrl,
        updateMessage: version.updateMessage,
        forceMessage: version.forceMessage,
      },
    });
  },
);
