import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  getAllAddresses,
  updateAddress,
} from "./address.controller.js";

const router = Router();

router.get("/", getAllAddresses);
router.post("/", addAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
