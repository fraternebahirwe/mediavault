import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;

export const signRefreshToken = (payload: { userId: string }) =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, env.jwt.refreshSecret) as { userId: string };
