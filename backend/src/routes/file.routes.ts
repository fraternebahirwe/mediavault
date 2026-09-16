import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import * as fileController from "../controllers/file.controller";

const router = Router();
router.use(requireAuth);

router.get("/", fileController.listFiles);
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.post("/trash/empty", fileController.emptyTrash);
router.get("/:id", fileController.getFile);
router.patch("/:id/rename", fileController.renameFile);
router.patch("/:id/move", fileController.moveFile);
router.patch("/:id/favorite", fileController.toggleFavorite);
router.post("/:id/tags", fileController.addTags);
router.delete("/:id/tags/:tagId", fileController.removeTag);
router.post("/:id/trash", fileController.softDeleteFile);
router.post("/:id/restore", fileController.restoreFile);
router.delete("/:id", fileController.permanentlyDeleteFile);

export default router;
