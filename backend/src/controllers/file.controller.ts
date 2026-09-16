import { Request, Response } from "express";
import { z } from "zod";
import { File, FileTag, Tag } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import * as fileService from "../services/file.service";

type FileWithTags = File & { tags?: (FileTag & { tag: Tag })[] };

export function serializeFile(file: FileWithTags) {
  return {
    id: file.id,
    userId: file.userId,
    folderId: file.folderId,
    fileName: file.fileName,
    fileType: file.fileType,
    mimeType: file.mimeType,
    fileSize: file.fileSize.toString(),
    storageUrl: file.storageUrl,
    thumbnailUrl: file.thumbnailUrl,
    isFavorite: file.isFavorite,
    isDeleted: file.isDeleted,
    deletedAt: file.deletedAt,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    tags: file.tags?.map((ft) => ({ id: ft.tag.id, name: ft.tag.name })) ?? [],
  };
}

const listQuerySchema = z.object({
  category: z
    .enum(["all", "photos", "videos", "documents", "favorites", "recent", "trash"])
    .optional(),
  folderId: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  minSize: z.coerce.number().optional(),
  maxSize: z.coerce.number().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(["name", "date", "size", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const listFiles = asyncHandler(async (req: Request, res: Response) => {
  const query = listQuerySchema.parse(req.query);
  const folderId = query.folderId === undefined ? undefined : query.folderId || null;
  const files = await fileService.listFiles(req.user!.userId, { ...query, folderId });
  res.json(files.map(serializeFile));
});

export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.getFileOrThrow(req.user!.userId, req.params.id);
  res.json(serializeFile(file));
});

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file provided");

  const folderId = typeof req.body.folderId === "string" && req.body.folderId ? req.body.folderId : undefined;

  const file = await fileService.uploadFile({
    userId: req.user!.userId,
    folderId,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
  });

  res.status(201).json(serializeFile(file));
});

const renameSchema = z.object({ fileName: z.string().min(1).max(255) });

export const renameFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileName } = renameSchema.parse(req.body);
  const file = await fileService.renameFile(req.user!.userId, req.params.id, fileName);
  res.json(serializeFile(file));
});

const moveSchema = z.object({ folderId: z.string().uuid().nullable() });

export const moveFile = asyncHandler(async (req: Request, res: Response) => {
  const { folderId } = moveSchema.parse(req.body);
  const file = await fileService.moveFile(req.user!.userId, req.params.id, folderId);
  res.json(serializeFile(file));
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.toggleFavorite(req.user!.userId, req.params.id);
  res.json(serializeFile(file));
});

const tagsSchema = z.object({ tags: z.array(z.string().min(1)).min(1) });

export const addTags = asyncHandler(async (req: Request, res: Response) => {
  const { tags } = tagsSchema.parse(req.body);
  const file = await fileService.addTags(req.user!.userId, req.params.id, tags);
  res.json(serializeFile(file));
});

export const removeTag = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.removeTag(req.user!.userId, req.params.id, req.params.tagId);
  res.json(serializeFile(file));
});

export const softDeleteFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.softDeleteFile(req.user!.userId, req.params.id);
  res.json(serializeFile(file));
});

export const restoreFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.restoreFile(req.user!.userId, req.params.id);
  res.json(serializeFile(file));
});

export const permanentlyDeleteFile = asyncHandler(async (req: Request, res: Response) => {
  await fileService.permanentlyDeleteFile(req.user!.userId, req.params.id);
  res.status(204).send();
});

export const emptyTrash = asyncHandler(async (req: Request, res: Response) => {
  const count = await fileService.emptyTrash(req.user!.userId);
  res.json({ deletedCount: count });
});
