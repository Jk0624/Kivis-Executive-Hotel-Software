import { Router } from "express";
import { optionalAuthenticate } from "../../../middleware/users/auth.middleware.js";
import { getAllCategories, getSingleCategory } from "./category.controller.js";

const router = Router();

router.get("/", optionalAuthenticate, getAllCategories);
router.get("/:id", optionalAuthenticate, getSingleCategory);

export default router;
