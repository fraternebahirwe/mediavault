import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import fileRoutes from "./file.routes";
import folderRoutes from "./folder.routes";
import dashboardRoutes from "./dashboard.routes";
import shareRoutes from "./share.routes";
import publicRoutes from "./public.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/shares", shareRoutes);
router.use("/public", publicRoutes);

export default router;
