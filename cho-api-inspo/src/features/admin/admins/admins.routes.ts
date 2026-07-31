import { Router } from "express";
import {
  createAdmin,
  deleteAdmin,
  disableAdmin,
  enableAdmin,
  listAdmins,
  updateAdminRole,
} from "./admins.controller.js";

const router = Router();

router.get("/", listAdmins);
router.post("/", createAdmin);
router.patch("/:id/disable", disableAdmin);
router.patch("/:id/enable", enableAdmin);
router.patch("/:id/role", updateAdminRole);
router.delete("/:id", deleteAdmin);

export default router;
