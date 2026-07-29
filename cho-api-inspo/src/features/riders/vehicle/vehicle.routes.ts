import { Router } from "express";
import {
  createOrUpdateVehicleInfo,
  getVehicleInfo,
  getIdImageUrls,
} from "./vehicle.controller.js";
import {
  upload,
  parseMultipartData,
} from "../../../middleware/common/upload.middleware.js";

const router = Router();

router.put(
  "/",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
  ]),
  parseMultipartData,
  createOrUpdateVehicleInfo,
);
router.get("/id-images", getIdImageUrls);
router.get("/", getVehicleInfo);

export default router;
