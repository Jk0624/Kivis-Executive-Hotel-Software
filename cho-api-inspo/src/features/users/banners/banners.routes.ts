import { Router } from "express";
import { listActiveBanners } from "./banners.controller.js";

const router = Router();

router.get("/", listActiveBanners);

export default router;
