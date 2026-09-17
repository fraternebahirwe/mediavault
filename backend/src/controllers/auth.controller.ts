import { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const REFRESH_COOKIE_BASE = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  path: "/api/auth",
};

// "Remember me" checked: a persistent cookie (survives browser restarts,
// matching the refresh token's real expiry). Unchecked: a session cookie
// (no maxAge) — the browser drops it as soon as it closes, even though the
// underlying token would otherwise still be valid.
const REFRESH_COOKIE_PERSISTENT = { ...REFRESH_COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 };
const REFRESH_COOKIE_SESSION = REFRESH_COOKIE_BASE;

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  remember: boolean
) {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTS);
  res.cookie("refreshToken", refreshToken, remember ? REFRESH_COOKIE_PERSISTENT : REFRESH_COOKIE_SESSION);
}

function toUserDto(user: { id: string; email: string; name: string; storageLimit: bigint }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    storageLimit: user.storageLimit.toString(),
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken, remember } = await authService.registerUser(
    email,
    password,
    name
  );
  setAuthCookies(res, accessToken, refreshToken, remember);
  res.status(201).json({ user: toUserDto(user), accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken, remember } = await authService.loginUser(
    email,
    password,
    rememberMe
  );
  setAuthCookies(res, accessToken, refreshToken, remember);
  res.json({ user: toUserDto(user), accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  const { user, accessToken, refreshToken, remember } = await authService.refreshSession(token);
  setAuthCookies(res, accessToken, refreshToken, remember);
  res.json({ user: toUserDto(user), accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  await authService.logoutUser(token);
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(204).send();
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotSchema.parse(req.body);
  await authService.requestPasswordReset(email);
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = resetSchema.parse(req.body);
  await authService.resetPassword(token, password);
  res.json({ message: "Password reset successful. You can now log in." });
});
