import multer from "multer";
import { env } from "../config/env";
import { isAllowedMimeType } from "../utils/fileType";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedMimeType(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});
