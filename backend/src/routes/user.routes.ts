import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, userController.getMe);

export default router;
