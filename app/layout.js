import "./globals.css";

export const metadata = {
  title: "Artovae",
  description: "A concept front-end for a visual art discovery platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
