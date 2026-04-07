import { create } from "zustand";

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

type UserProfile = {
  auth_user: AuthUser;
  profile: Profile;
};

type UserStore = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
