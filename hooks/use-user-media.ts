import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { useUserStore } from "@/store/useUserStore";
import type { UserImage } from "@/types/media";

type UserMeResponse = {
  media?: UserImage[];
};

async function fetchUserMedia(): Promise<UserImage[]> {
  const response = await api.get<UserMeResponse>("/api/user/me");
  return response.data.media ?? [];
}

export function useUserMedia() {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const userId = useUserStore((state) => state.user?.auth_user.id);

  return useQuery({
    queryKey: queryKeys.userMedia(userId ?? "me"),
    queryFn: fetchUserMedia,
    enabled: hasHydrated && Boolean(userId),
  });
}
