import { Router } from "express";
import * as publicController from "../controllers/public.controller";

const router = Router();

router.get("/:token", publicController.getPublicShare);
router.get("/:token/download", publicController.downloadPublicShare);

export default router;
