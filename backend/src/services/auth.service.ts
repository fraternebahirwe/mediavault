import crypto from "crypto";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { comparePassword, hashPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";
import { sendPasswordResetEmail } from "./email.service";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

async function issueTokens(userId: string, email: string, remember: boolean) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, remember });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  return { accessToken, refreshToken, remember };
}

export async function registerUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      storageLimit: BigInt(env.defaultStorageLimitBytes),
    },
  });

  // A brand-new signup starts as a "remembered" session by default.
  const tokens = await issueTokens(user.id, user.email, true);
  return { user, ...tokens };
}

export async function loginUser(email: string, password: string, remember: boolean) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const tokens = await issueTokens(user.id, user.email, remember);
  return { user, ...tokens };
}

export async function refreshSession(refreshToken: string) {
  let payload: { userId: string; remember: boolean };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Session expired, please log in again");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw ApiError.unauthorized("User no longer exists");

  // deleteMany (not delete) so a concurrent request that already consumed
  // this token doesn't crash with a "record not found" error.
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  // Carry the original "remember me" choice forward so silent token
  // rotation doesn't silently upgrade a session-only login into a
  // persistent one (or vice versa).
  const tokens = await issueTokens(user.id, user.email, payload.remember ?? false);
  return { user, ...tokens };
}

export async function logoutUser(refreshToken?: string) {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always resolve silently — don't leak whether an account exists.
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });

  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest("This reset link is invalid or has expired");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);
}
