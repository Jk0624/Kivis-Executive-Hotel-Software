import { Router, Request, Response, NextFunction } from "express";
import {
  addFood,
  getAllFood,
  getSingleFood,
  updateFood,
  deleteFood,
  toggleFavoriteFood,
  getUserFavoriteFoods,
  addAddonToFood,
  removeAddonFromFood,
  getFoodAddons,
} from "./food.controller.js";
import { upload, parseMultipartData } from "../../../middleware/common/upload.middleware.js";
import { authenticate, optionalAuthenticate } from "../../../middleware/users/auth.middleware.js";

const router = Router();

// Skip user-token check when vendorAuthenticate or adminAuthenticate has already run
const requiresAuth = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).vendorId || (req as any).adminId) return next();
  authenticate(req, res, next);
};

router.get("/", optionalAuthenticate, getAllFood);
router.get("/favorites", authenticate, getUserFavoriteFoods); // Must come before /:id route
router.post("/toggle-favorite", authenticate, toggleFavoriteFood); // Must come before /:id route
router.get("/:id", optionalAuthenticate, getSingleFood);
router.post("/", requiresAuth, upload.single("image"), parseMultipartData, addFood);
router.put("/:id", requiresAuth, upload.single("image"), parseMultipartData, updateFood);
router.delete("/:id", requiresAuth, deleteFood);

// Food-Addon routes
router.post("/:foodId/addons", requiresAuth, addAddonToFood);
router.delete("/:foodId/addons/:addonId", requiresAuth, removeAddonFromFood);
router.get("/:foodId/addons", optionalAuthenticate, getFoodAddons);

export default router;
