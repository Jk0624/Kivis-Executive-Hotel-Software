import { Router } from "express";
import {
  listBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} from "./banners.controller.js";
import {
  upload,
  parseMultipartData,
} from "../../../middleware/common/upload.middleware.js";

const router = Router();

router.get("/", listBanners);
router.get("/:id", getBanner);
router.post("/", upload.single("image"), parseMultipartData, createBanner);
router.put("/:id", upload.single("image"), parseMultipartData, updateBanner);
router.delete("/:id", deleteBanner);

export default router;
