import { Request, Response } from "express";
import { z } from "zod";
import { SharePermission } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import * as shareService from "../services/share.service";

const createSchema = z.object({
  fileId: z.string().uuid(),
  permission: z.nativeEnum(SharePermission).optional(),
  isPublic: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

function serializeLink(link: { id: string; token: string; fileId: string; permission: string; isPublic: boolean; isActive: boolean; expiresAt: Date | null; createdAt: Date }) {
  return { ...link, shareUrl: `${process.env.CLIENT_URL ?? "http://localhost:5173"}/share/${link.token}` };
}

export const createShareLink = asyncHandler(async (req: Request, res: Response) => {
  const body = createSchema.parse(req.body);
  const link = await shareService.createShareLink(req.user!.userId, body.fileId, body);
  res.status(201).json(serializeLink(link));
});

export const listShareLinks = asyncHandler(async (req: Request, res: Response) => {
  const links = await shareService.listShareLinksForFile(req.user!.userId, req.params.fileId);
  res.json(links.map(serializeLink));
});

const toggleSchema = z.object({ isActive: z.boolean() });

export const setShareLinkActive = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = toggleSchema.parse(req.body);
  const link = await shareService.setShareLinkActive(req.user!.userId, req.params.id, isActive);
  res.json(serializeLink(link));
});

export const deleteShareLink = asyncHandler(async (req: Request, res: Response) => {
  await shareService.deleteShareLink(req.user!.userId, req.params.id);
  res.status(204).send();
});
