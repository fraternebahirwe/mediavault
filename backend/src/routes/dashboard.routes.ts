import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/", requireAuth, dashboardController.getDashboard);

export default router;
