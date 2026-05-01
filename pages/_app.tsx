import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Toaster } from "sonner"
import { api } from "lib/apiClient";
import { useUserStore } from "store/useUserStore";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import "static/globals.css";

function AuthBootstrap() {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let isMounted = true;

    async function syncUserFromSession() {
      try {
        const response = await api.get("/api/user/me");

        if (!isMounted) {
          return;
        }

        setUser(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearUser();
      }
    }

    void syncUserFromSession();

    return () => {
      isMounted = false;
    };
  }, [clearUser, hasHydrated, setUser]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>Picsal</title>
        <meta name="description" content="A concept front-end for a visual art discovery platform." />
        <link rel="icon" href="static/logo.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <div className="dark">
          <AuthBootstrap />
          <Toaster position="top-center"
            theme="system"
            closeButton />
          <Component {...pageProps} />
        </div>
      </QueryClientProvider>

    </>
  );
}
