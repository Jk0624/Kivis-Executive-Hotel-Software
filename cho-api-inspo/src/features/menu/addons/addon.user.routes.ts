import { Router } from "express";
import { getAllAddons, getSingleAddon } from "./addon.controller.js";

const router = Router();

router.get("/", getAllAddons);
router.get("/:id", getSingleAddon);

export default router;
