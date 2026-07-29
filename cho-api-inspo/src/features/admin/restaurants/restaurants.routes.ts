import { Router } from "express";
import {
  listRestaurants,
  listRestaurantOptions,
  getRestaurant,
  updateRestaurantProfile,
} from "./restaurants.controller.js";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import { upload, parseMultipartData } from "../../../middleware/common/upload.middleware.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);

// Specific paths must come before /:id to avoid being swallowed by the param route
router.get("/", supportOrSuper, listRestaurants);
router.get("/options", supportOrSuper, listRestaurantOptions);
router.get("/:id", supportOrSuper, getRestaurant);
router.patch(
  "/:id/profile",
  supportOrSuper,
  upload.single("image"),
  parseMultipartData,
  updateRestaurantProfile,
);

export default router;
