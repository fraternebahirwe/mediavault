import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createShareLinkRequest,
  deleteShareLinkRequest,
  listShareLinksRequest,
  setShareLinkActiveRequest,
} from "../api/share.api";
import { SharePermission } from "../types";
import { getApiErrorMessage } from "../api/client";

export function useShareLinks(fileId: string | null) {
  return useQuery({
    queryKey: ["shares", fileId],
    queryFn: () => listShareLinksRequest(fileId as string),
    enabled: !!fileId,
  });
}

export function useCreateShareLink(fileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: { permission?: SharePermission; isPublic?: boolean }) =>
      createShareLinkRequest(fileId as string, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", fileId] });
      toast.success("Share link created");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not create link")),
  });
}

export function useSetShareLinkActive(fileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; isActive: boolean }) =>
      setShareLinkActiveRequest(vars.id, vars.isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares", fileId] }),
  });
}

export function useDeleteShareLink(fileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShareLinkRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", fileId] });
      toast.success("Share link removed");
    },
  });
}
