import { Request, Response } from "express";
import { SharePermission } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import * as shareService from "../services/share.service";
import { serializeFile } from "./file.controller";

export const getPublicShare = asyncHandler(async (req: Request, res: Response) => {
  const link = await shareService.resolvePublicShareLink(req.params.token);
  res.json({
    file: serializeFile(link.file),
    permission: link.permission,
    isPublic: link.isPublic,
  });
});

export const downloadPublicShare = asyncHandler(async (req: Request, res: Response) => {
  const link = await shareService.resolvePublicShareLink(req.params.token);
  if (link.permission !== SharePermission.DOWNLOAD) {
    throw ApiError.forbidden("This link does not allow downloading");
  }
  res.redirect(link.file.storageUrl);
});
