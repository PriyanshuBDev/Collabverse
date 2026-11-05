import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SafeThemeProvider } from "@/components/wrappers/SafeThemeProvider";
import QueryProvider from "@/components/wrappers/QueryProvider";
import { Suspense } from "react";
import GlobalLoading from "@/components/loadings/GlobalLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollabVerse — Work moves better together",
  description:
    "Projects, conversations, and your team's shared workspace in one secure place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <SafeThemeProvider>
          <QueryProvider>
            <Suspense fallback={<GlobalLoading />}>{children}</Suspense>
            <Toaster position="top-center" richColors></Toaster>
          </QueryProvider>
        </SafeThemeProvider>
      </body>
    </html>
  );
}
