import { UserImage } from "./media";

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
    media: UserImage[];
  };

export type { UserProfile };