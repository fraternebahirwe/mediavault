import { apiClient, setAccessToken } from "./client";
import { User } from "../types";

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function registerRequest(data: { name: string; email: string; password: string }) {
  const res = await apiClient.post<AuthResponse>("/auth/register", data);
  setAccessToken(res.data.accessToken);
  return res.data.user;
}

export async function loginRequest(data: { email: string; password: string }) {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  setAccessToken(res.data.accessToken);
  return res.data.user;
}

export async function logoutRequest() {
  setAccessToken(null);
  await apiClient.post("/auth/logout");
}

export async function refreshRequest() {
  const res = await apiClient.post<AuthResponse>("/auth/refresh");
  setAccessToken(res.data.accessToken);
  return res.data.user;
}

export async function forgotPasswordRequest(email: string) {
  const res = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
  return res.data.message;
}

export async function resetPasswordRequest(token: string, password: string) {
  const res = await apiClient.post<{ message: string }>("/auth/reset-password", {
    token,
    password,
  });
  return res.data.message;
}

export async function getMeRequest() {
  const res = await apiClient.get<User>("/users/me");
  return res.data;
}
