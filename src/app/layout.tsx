import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/shell/animated-background";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["600"] });

const SITE_URL = "https://utbk-planner.vercel.app";
const DESCRIPTION = "Calendar-first UTBK 2027 fundamental study planner for November 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Calendar · UTBK Planner", template: "%s · UTBK Planner" },
  description: DESCRIPTION,
  applicationName: "UTBK Planner",
  authors: [{ name: "UTBK Planner" }],
  keywords: ["UTBK 2027", "study planner", "calendar", "SNBT", "Indonesia"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "UTBK Planner", title: "UTBK 2027 Fundamental Study Planner", description: DESCRIPTION, locale: "id_ID" },
  twitter: { card: "summary_large_image", title: "UTBK Planner", description: DESCRIPTION },
  appleWebApp: { capable: true, title: "UTBK Planner", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F1F5F2" }, { media: "(prefers-color-scheme: dark)", color: "#071F18" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full`}>
      <body className="h-full overflow-hidden">
        <Providers>
          <AnimatedBackground />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
