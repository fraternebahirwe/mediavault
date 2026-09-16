import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import * as shareController from "../controllers/share.controller";

const router = Router();
router.use(requireAuth);

router.post("/", shareController.createShareLink);
router.get("/file/:fileId", shareController.listShareLinks);
router.patch("/:id", shareController.setShareLinkActive);
router.delete("/:id", shareController.deleteShareLink);

export default router;
