import { Router } from "express";
import {
  addPack,
  getAllPacks,
  getSinglePack,
  updatePack,
  deletePack,
} from "./pack.controller.js";
const router = Router();

router.post("/", addPack);
router.get("/", getAllPacks);
router.get("/:id", getSinglePack);
router.put("/:id", updatePack);
router.delete("/:id", deletePack);

export default router;



