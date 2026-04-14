import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};

type Profile = {
  id: string;
  created_at: string;
  description: string;
  display_name: string;
  profile_picture: string | null;
  can_access: boolean;
};

type UserImage = {
  id: string,
  user_id: string,
  object_key: string,
  public_url: string,
  kind: string,
  created_at: string,
  title: string,
  description: string,
  preview_object_key: string,
  preview_public_url: string
};


type UserProfile = {
  auth_user: AuthUser;
  profile: Profile;
  media: UserImage[];
};

type UserStore = {
  user: UserProfile | null;
  hasHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "picsal-user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
