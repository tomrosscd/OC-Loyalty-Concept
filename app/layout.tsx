import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outcast | The Heartbreak Hotel",
  description: "Check in to Outcast loyalty. Explore four hotel floors, earn points and unlock exclusive access.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
