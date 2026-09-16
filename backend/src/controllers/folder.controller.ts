import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as folderService from "../services/folder.service";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
});
const renameSchema = z.object({ name: z.string().min(1).max(255) });

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const { name, parentId } = createSchema.parse(req.body);
  const folder = await folderService.createFolder(req.user!.userId, name, parentId);
  res.status(201).json(folder);
});

export const listFolders = asyncHandler(async (req: Request, res: Response) => {
  const parentId = req.query.parentId === undefined ? undefined : (req.query.parentId as string) || null;
  const folders = await folderService.listFolders(req.user!.userId, parentId);
  res.json(folders);
});

export const renameFolder = asyncHandler(async (req: Request, res: Response) => {
  const { name } = renameSchema.parse(req.body);
  const folder = await folderService.renameFolder(req.user!.userId, req.params.id, name);
  res.json(folder);
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  await folderService.deleteFolder(req.user!.userId, req.params.id);
  res.status(204).send();
});
