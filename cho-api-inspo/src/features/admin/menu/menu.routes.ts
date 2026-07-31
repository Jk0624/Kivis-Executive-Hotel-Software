import { Router } from "express";
import foodRoutes from "../../menu/food/food.routes.js";
import addonRoutes from "../../menu/addons/addon.routes.js";
import packRoutes from "../../menu/packs/pack.routes.js";
import categoryRoutes from "../../menu/categories/category.routes.js";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../menu/categories/category.controller.js";

const router = Router();

// Admin re-uses the existing menu routes.
// adminAuthenticate is applied at the app level before this router, so
// the requiresAuth helpers in each route file will see req.adminId and pass through.
router.use("/foods", foodRoutes);
router.use("/addons", addonRoutes);
router.use("/packs", packRoutes);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.use("/categories", categoryRoutes);

export default router;
