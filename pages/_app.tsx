import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "sonner"


import "static/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Picsal</title>
        <meta name="description" content="A concept front-end for a visual art discovery platform." />
        <link rel="icon" href="static/logo.png" />
      </Head>
      <div className="dark">
        <Toaster position="top-center"
          theme="system"
          closeButton/>
        <Component {...pageProps} />
      </div>
    </>
  );
}
