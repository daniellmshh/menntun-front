import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse } from "@/types";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export const ACTIVE_MODULES_QUERY_KEY = ["activeModules"];

export function useActiveModules() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // When the logged-in user changes (e.g. after re-login), invalidate the cached modules
  // so the next render always fetches fresh data from the server.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ACTIVE_MODULES_QUERY_KEY });
  }, [user?.id, queryClient]);

  const { data, isLoading } = useQuery<string[]>({
    queryKey: ACTIVE_MODULES_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<ApiResponse<string[]>>("/auth/me/modules");
      return response.data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — allows changes to propagate quickly
    refetchOnMount: true,      // always refetch when the Sidebar mounts after navigation
    refetchOnWindowFocus: true, // refetch when user returns to the tab
    enabled: !!user,           // only fetch when there is an authenticated user
  });

  return {
    modules: data || [],
    isLoading,
  };
}
