import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: err.flatten(),
    });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  if (!env.isProd) {
    console.error(err);
  }

  res.status(500).json({
    message: env.isProd ? "Internal server error" : message,
  });
}
