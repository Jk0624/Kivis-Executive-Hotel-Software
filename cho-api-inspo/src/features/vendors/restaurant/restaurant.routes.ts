import { Router } from "express";
import {
  createRestaurant,
  updateRestaurant,
  getMyRestaurants,
  setOperatingHours,
} from "./restaurant.controller.js";
import { upload, parseMultipartData } from "../../../middleware/common/upload.middleware.js";

const router = Router();

router.get("/mine", getMyRestaurants);
router.post("/", upload.single("image"), parseMultipartData, createRestaurant);
router.patch("/:id", upload.single("image"), parseMultipartData, updateRestaurant);
router.post("/:id/operating-hours", setOperatingHours);

export default router;
