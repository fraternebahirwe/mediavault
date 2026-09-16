import { apiClient } from "./client";
import { DashboardStats } from "../types";

export async function getDashboardRequest() {
  const res = await apiClient.get<DashboardStats>("/dashboard");
  return res.data;
}
