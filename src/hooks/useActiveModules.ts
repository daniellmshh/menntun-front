import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export const ACTIVE_MODULES_QUERY_KEY = ["activeModules"] as const;

export function useActiveModules() {
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = user?.activeSchoolId ?? user?.schoolId ?? null;

  const { data, isLoading } = useQuery<string[]>({
    // Module activation is scoped to both the current user and school context.
    queryKey: [...ACTIVE_MODULES_QUERY_KEY, user?.id ?? null, activeSchoolId],
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
