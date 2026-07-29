import { Router } from "express";
import { listUsers, getUser, toggleUserActive, lookupUser } from "./users.controller.js";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);

router.get("/", supportOrSuper, listUsers);
router.get("/lookup", supportOrSuper, lookupUser);
router.get("/:id", supportOrSuper, getUser);
router.patch("/:id/toggle-active", supportOrSuper, toggleUserActive);

export default router;
