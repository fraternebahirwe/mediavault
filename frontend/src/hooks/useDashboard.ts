import { useQuery } from "@tanstack/react-query";
import { getDashboardRequest } from "../api/dashboard.api";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboardRequest });
}
