import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CIREME — Cayman Islands Real Estate Market Explorer",
  description:
    "An open Cayman Islands real-estate marketplace for private sellers and independent brokers — no compensation lock-in.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
