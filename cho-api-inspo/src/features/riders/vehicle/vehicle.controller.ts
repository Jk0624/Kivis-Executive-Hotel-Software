import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { VehicleType } from "../../../generated/prisma/enums.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import { uploadToPrivateS3, deleteFromPrivateS3, generateSignedUrl } from "../../../utils/s3.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { UpdateVehicleInfoBody } from "./vehicle.types.js";

function formatVehicleResponse(vehicleInfo: any) {
  const { idFrontKey, idBackKey, ...rest } = vehicleInfo;
  return {
    ...rest,
    id: vehicleInfo.id.toString(),
    riderId: vehicleInfo.riderId.toString(),
    hasIdFront: !!idFrontKey,
    hasIdBack: !!idBackKey,
  };
}

export const createOrUpdateVehicleInfo = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { vehicleType, vehicleBrand, numberPlate }: UpdateVehicleInfoBody = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const isLocked =
      rider.verificationStatus === VerificationStatus.UNDER_REVIEW ||
      rider.verificationStatus === VerificationStatus.VERIFIED;

    if (isLocked) {
      const tryingToChangeLocked =
        files?.idFront?.[0] || files?.idBack?.[0] || vehicleType || vehicleBrand;
      if (tryingToChangeLocked) {
        res.status(403).json({
          success: false,
          message: "ID and vehicle details cannot be changed while under review or after verification.",
        });
        return;
      }
    }

    try {
      const existing = await prisma.riderVehicleInfo.findUnique({
        where: { riderId: rider.id },
      });

      let idFrontKey = existing?.idFrontKey || null;
      let idBackKey = existing?.idBackKey || null;

      // Upload front image if provided
      if (files?.idFront?.[0]) {
        const oldFrontKey = idFrontKey;
        idFrontKey = await uploadToPrivateS3(
          files.idFront[0].buffer,
          files.idFront[0].originalname,
          "rider-id",
        );
        if (oldFrontKey) await deleteFromPrivateS3(oldFrontKey);
      }

      // Upload back image if provided
      if (files?.idBack?.[0]) {
        const oldBackKey = idBackKey;
        idBackKey = await uploadToPrivateS3(
          files.idBack[0].buffer,
          files.idBack[0].originalname,
          "rider-id",
        );
        if (oldBackKey) await deleteFromPrivateS3(oldBackKey);
      }

      const finalVehicleType = vehicleType || existing?.vehicleType || null;
      const finalVehicleBrand = vehicleBrand || existing?.vehicleBrand || null;
      const finalNumberPlate = numberPlate || existing?.numberPlate || null;

      const isInfoComplete =
        !!idFrontKey &&
        !!idBackKey &&
        !!finalVehicleType &&
        !!finalVehicleBrand;

      const vehicleInfo = await prisma.riderVehicleInfo.upsert({
        where: { riderId: rider.id },
        create: {
          riderId: rider.id,
          idFrontKey,
          idBackKey,
          vehicleType: finalVehicleType as VehicleType,
          vehicleBrand: finalVehicleBrand,
          numberPlate: finalNumberPlate,
          isInfoComplete,
        },
        update: {
          idFrontKey,
          idBackKey,
          vehicleType: finalVehicleType as VehicleType,
          vehicleBrand: finalVehicleBrand,
          numberPlate: finalNumberPlate,
          isInfoComplete,
        },
      });

      res.status(200).json({
        success: true,
        message: existing
          ? "Vehicle information updated successfully"
          : "Vehicle information added successfully",
        data: formatVehicleResponse(vehicleInfo),
      });
    } catch (error: any) {
      console.error("Error updating vehicle info:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating vehicle information.",
      });
    }
  },
);

export const getVehicleInfo = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const vehicleInfo = await prisma.riderVehicleInfo.findUnique({
        where: { riderId: rider.id },
      });

      res.status(200).json({
        success: true,
        data: vehicleInfo ? formatVehicleResponse(vehicleInfo) : null,
      });
    } catch (error: any) {
      console.error("Error fetching vehicle info:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching vehicle information.",
      });
    }
  },
);

export const getIdImageUrls = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (rider.verificationStatus !== VerificationStatus.PENDING) {
      res.status(403).json({
        success: false,
        message: "ID images are not available after submission.",
      });
      return;
    }

    try {
      const vehicleInfo = await prisma.riderVehicleInfo.findUnique({
        where: { riderId: rider.id },
      });

      if (!vehicleInfo?.idFrontKey && !vehicleInfo?.idBackKey) {
        res.status(404).json({
          success: false,
          message: "No ID images found.",
        });
        return;
      }

      const [idFront, idBack] = await Promise.all([
        vehicleInfo.idFrontKey ? generateSignedUrl(vehicleInfo.idFrontKey) : null,
        vehicleInfo.idBackKey ? generateSignedUrl(vehicleInfo.idBackKey) : null,
      ]);

      res.status(200).json({
        success: true,
        data: { idFront, idBack },
      });
    } catch (error: any) {
      console.error("Error generating ID image URLs:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching ID images.",
      });
    }
  },
);
