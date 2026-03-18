import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExtensionHub | Open Browser Extension Marketplace",
  description:
    "Developer upload extension folder, system make it zip automatically, users can download directly and use.",
  keywords: ["browser extensions", "chrome extensions", "marketplace", "github", "open source", "extensionhub", "dev tools"],
  authors: [{ name: "ExtensionHub Team" }],
  openGraph: {
    title: "ExtensionHub | Open Browser Extension Marketplace",
    description: "Developer upload extension folder, system make it zip automatically, users can download directly and use.",
    url: "https://extensionwebstore.vercel.app",
    siteName: "ExtensionHub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExtensionHub Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExtensionHub | Open Browser Extension Marketplace",
    description: "Developer upload extension folder, system make it zip automatically, users can download directly and use.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
