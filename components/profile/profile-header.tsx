import { useEffect, useState, SubmitEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button"
import {
    ButtonGroup,
    ButtonGroupSeparator,
} from "@/components/ui/button-group"
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/useUserStore"
import { toast } from "sonner"
import { createClient } from "lib/createBrowserClient";
import UploadDialog from "../dialogs/upload-dialog";
import EditProfileDialog from "../dialogs/edit-profile-dialog";

const DEFAULT_PROFILE_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#23160a" />
          <stop offset="100%" stop-color="#0b0b0b" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#avatarBg)" />
      <circle cx="80" cy="62" r="28" fill="#f6e7bf" />
      <path d="M32 138c9-24 28-38 48-38s39 14 48 38" fill="#f6e7bf" />
      <circle cx="80" cy="80" r="76" fill="none" stroke="#d4a017" stroke-width="4" />
    </svg>
  `);

export default function ProfileHeader() {
    const user = useUserStore((state) => state.user);
    const profileImage = user?.profile.profile_picture || DEFAULT_PROFILE_IMAGE;
    const displayName =
        user?.profile.display_name?.trim() ||
        user?.auth_user.display_name?.trim() ||
        user?.auth_user.email ||
        "";
    const email = user?.auth_user.email || "";
    const handle = email ? `@${email.split("@")[0].toLowerCase()}` : "";
    const description = user?.profile.description?.trim() || "";
    const joinedLabel = user?.profile.created_at
        ? new Date(user.profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : "";
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const hasHydrated = useUserStore((state) => state.hasHydrated);
    const [supabase] = useState(() => createClient());

    function showToastWarning(feature: string) {
        return toast.warning(`Unavailable, ${feature} feature still in progress.`)
    }

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (user) {
            setIsProfileLoading(false);
            return;
        }

        async function checkSessionState() {
            const { data } = await supabase.auth.getSession();

            if (!data.session) {
                setIsProfileLoading(false);
            }
        }

        void checkSessionState();
    }, [hasHydrated, supabase, user]);

    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center
            overflow-hidden rounded-full bg-[#111111] text-5xl font-semibold uppercase
            tracking-[0.16em] text-stone-100 sm:mx-0 sm:h-32 sm:w-32">
                    <img
                        src={profileImage}
                        alt={`${displayName} profile`}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 pt-1 text-center sm:text-left">
                    <h1 className="text-[15px] font-semibold leading-tight text-stone-50 sm:text-[24px]">
                        {displayName || (isProfileLoading ? <Skeleton className="mt-[10px] h-[30px] w-[150px] rounded-full mx-auto sm:mx-0" /> : "")}
                    </h1>
                    {handle ? (
                        <p className="mt-1 text-sm text-stone-500 sm:text-base">{handle}</p>
                    ) : null}

                    {(description || email || joinedLabel) ? (
                        <div className="mt-4 space-y-1.5 text-sm leading-6 text-stone-100 sm:text-[15px]">
                            {description ? <p>{description}</p> : null}
                            {email ? <p>contact: {email}</p> : null}
                            {joinedLabel ? <p className="text-stone-400">joined {joinedLabel}</p> : null}
                        </div>
                    ) : null}
                    {!description && !email && !joinedLabel && isProfileLoading ? (
                        (
                            <div>
                                <Skeleton className="mt-[12px] h-[20px] w-[200px] rounded-full mx-auto sm:mx-0" />
                                <Skeleton className="mt-[12px] h-[20px] w-[180px] rounded-full mx-auto sm:mx-0" />
                            </div>
                        )
                    ) : null}

                </div>
            </div>

            <div className="flex justify-center sm:justify-end items-center mt-2">
                <ButtonGroup>
                    <EditProfileDialog />
                    <ButtonGroupSeparator />
                    <UploadDialog />
                </ButtonGroup>

            </div>
        </div>
    )
}