import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { QueryProvider } from "@/client/providers/query-provider";
import { Toaster } from "@/components/atoms";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growth",
  description: "A gamified life planner. Set priorities, plant goals, watch them bloom.",
  // `next/manifest` auto-injects the rel=manifest tag from `src/app/manifest.ts`.
  // The favicon + Apple touch icon need to be declared here.
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Growth",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a6647",
  // Lock to the device width and keep zoom available — accessibility wins.
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
