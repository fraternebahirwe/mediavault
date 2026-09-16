import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import * as folderController from "../controllers/folder.controller";

const router = Router();
router.use(requireAuth);

router.get("/", folderController.listFolders);
router.post("/", folderController.createFolder);
router.patch("/:id", folderController.renameFolder);
router.delete("/:id", folderController.deleteFolder);

export default router;
