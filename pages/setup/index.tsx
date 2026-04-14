import { SubmitEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "lib/apiClient";
import { createClient } from "lib/createBrowserClient";
import { getDisplayNameFromMetadata, hasCompletedProfileSetup } from "lib/profileSetup";
import { useUserStore } from "store/useUserStore";

const artwork = "/static/img/login.jpg";

function getNextPath(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/user";
  }

  return value;
}

export default function SetupPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [authEmail, setAuthEmail] = useState("");

  const existingDisplayName = user?.profile.display_name?.trim() || user?.auth_user.display_name?.trim() || "";
  const email = user?.auth_user.email || authEmail;

  useEffect(() => {
    if (existingDisplayName) {
      setDisplayName(existingDisplayName);
    }
  }, [existingDisplayName]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    let isActive = true;

    async function hydrateSetupState() {
      let shouldShowSetupForm = false;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isActive) {
          return;
        }

        const authUser = session?.user;

        if (!authUser) {
          const nextPath = encodeURIComponent(getNextPath(router.query.next) || "/setup");
          await router.replace(`/login?next=${nextPath}`);
          return;
        }

        setAuthEmail(authUser.email || "");

        if (hasCompletedProfileSetup(authUser.user_metadata)) {
          await router.replace("/user");
          return;
        }

        shouldShowSetupForm = true;

        if (!useUserStore.getState().user) {
          try {
            const response = await api.get("/api/user/me");

            if (!isActive) {
              return;
            }

            setUser(response.data);
          } catch (fetchError) {
            console.error("Unable to hydrate user during setup", fetchError);
          }
        }
      } catch (error) {
        console.error("Unable to verify setup access", error);
        setErrorMessage("We couldn't verify your session. Try refreshing the page.");
        shouldShowSetupForm = true;
      } finally {
        if (isActive && shouldShowSetupForm) {
          setIsCheckingAccess(false);
        }
      }
    }

    void hydrateSetupState();

    return () => {
      isActive = false;
    };
  }, [router, router.isReady, setUser, supabase]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDisplayName = displayName.trim();
    const nextPath = getNextPath(router.query.next);

    if (!normalizedDisplayName) {
      setErrorMessage("Display name is required.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: normalizedDisplayName,
      },
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    const currentUser = useUserStore.getState().user;

    if (currentUser) {
      setUser({
        ...currentUser,
        auth_user: {
          ...currentUser.auth_user,
          display_name: normalizedDisplayName,
        },
      });
    }

    const fallbackDisplayName = getDisplayNameFromMetadata(data.user?.user_metadata) || normalizedDisplayName;

    void (async () => {
      try {
        const response = await api.get("/api/user/me");

        setUser({
          ...response.data,
          auth_user: {
            ...response.data.auth_user,
            display_name: response.data?.auth_user?.display_name?.trim() || fallbackDisplayName,
          },
        });
      } catch (fetchError) {
        console.error("Unable to refresh user profile after setup", fetchError);
      }
    })();

    setIsSubmitting(false);
    await router.replace(nextPath);
  }

  if (isCheckingAccess) {
    return (
      <main className="relative isolate min-h-dvh overflow-hidden bg-canvas px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <img
          src={artwork}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-[#020202]/70" />

        <div className="relative z-10 mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-[1600px] items-stretch overflow-hidden rounded-xl border border-line bg-[#070707] shadow-glow sm:h-[calc(100dvh-3rem)]">
          <section className="flex w-full items-center justify-center bg-[#090909] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
            <div className="w-full max-w-[460px]">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
                Finishing setup
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-stone-50 sm:text-5xl">
                Preparing your profile.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-stone-400">
                Checking your account so we can open the final setup step.
              </p>
            </div>
          </section>

          <section className="relative hidden lg:block lg:w-1/2">
            <img
              src={artwork}
              alt="Featured fantasy artwork"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-canvas px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <img
        src={artwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-[#020202]/70" />

      <div className="relative z-10 mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-[1600px] items-stretch overflow-hidden rounded-xl border border-line bg-[#070707] shadow-glow sm:h-[calc(100dvh-3rem)]">
        <section className="flex w-full items-center justify-center bg-[#090909] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
          <div className="w-full max-w-[460px]">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
              Profile setup
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-stone-50 sm:text-5xl">
              Welcome to Picsal.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-400">
              Your email is confirmed. Pick the name that should appear on your Picsal profile and we&apos;ll take you
              straight into your account.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-stone-500">
              <span className="text-amber-300">01 Verified</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-amber-300">02 Setup</span>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="setup-display-name" className="text-sm font-medium text-stone-200">
                    Display name
                  </FieldLabel>
                  <Input
                    id="setup-display-name"
                    value={displayName}
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="nickname"
                    required
                    className="h-auto rounded-md border-line bg-[#111111] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus-visible:border-amber-400/50 focus-visible:ring-0"
                  />
                  <FieldDescription className="text-stone-500">
                    This can only be set during your first-time setup.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {email ? (
                <div className="rounded-2xl border border-line bg-[#111111] px-4 py-4 text-sm leading-7 text-stone-300">
                  Signed in as <span className="text-stone-100">{email}</span>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-sm leading-7 text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-amber-400/35 bg-[#17120a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/60 hover:bg-[#21180b] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#111111] disabled:text-stone-500"
              >
                {isSubmitting ? "Saving..." : "Finish Setup"}
              </button>
            </form>
          </div>
        </section>

        <section className="relative hidden lg:block lg:w-1/2">
          <img
            src={artwork}
            alt="Featured fantasy artwork"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/75 p-8 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Featured Artwork</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
              By Community Artist
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
