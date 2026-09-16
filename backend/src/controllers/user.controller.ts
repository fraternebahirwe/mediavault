import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getUserPublicProfile } from "../services/user.service";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getUserPublicProfile(req.user!.userId);
  res.json({
    ...profile,
    storageLimit: profile.storageLimit.toString(),
    storageUsed: profile.storageUsed.toString(),
  });
});
