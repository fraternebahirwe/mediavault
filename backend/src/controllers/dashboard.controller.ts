import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getDashboardStats } from "../services/file.service";
import { serializeFile } from "./file.controller";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDashboardStats(req.user!.userId);
  res.json({
    totalFiles: stats.totalFiles,
    photos: stats.photos,
    videos: stats.videos,
    documents: stats.documents,
    favorites: stats.favorites,
    storageUsed: stats.storageUsed.toString(),
    storageLimit: stats.storageLimit.toString(),
    recentFiles: stats.recentFiles.map(serializeFile),
  });
});
