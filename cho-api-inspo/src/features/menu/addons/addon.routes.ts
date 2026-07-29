import { Router } from "express";
import {
  addAddon,
  getAllAddons,
  getSingleAddon,
  updateAddon,
  deleteAddon,
} from "./addon.controller.js";

const router = Router();

router.post("/", addAddon);
router.get("/", getAllAddons);
router.get("/:id", getSingleAddon);
router.put("/:id", updateAddon);
router.delete("/:id", deleteAddon);

export default router;
