import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../../../middleware/users/auth.middleware.js";
import {
  addRestaurant,
  getAllRestaurant,
  getSingleRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "./restaurant.controller.js";

const router = Router();

router.get("/", optionalAuthenticate, getAllRestaurant);
router.get("/:id", optionalAuthenticate, getSingleRestaurant);

router.post("/", authenticate, addRestaurant);
router.put("/:id", authenticate, updateRestaurant);
router.delete("/:id", authenticate, deleteRestaurant);

export default router;
