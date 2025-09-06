import type React from "react";
import type { Metadata } from "next";
import { Work_Sans, Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-work-sans",
});

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Hội nghị",
  description: "Hệ thống quản lý hội nghị chuyên nghiệp với tính năng PWA",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["hội nghị", "quản lý", "sự kiện", "PWA", "mobile"],
  authors: [{ name: "Conference Management System" }],
  creator: "v0.app",
  publisher: "Conference Management System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hội nghị",
  },
  openGraph: {
    type: "website",
    siteName: "Hệ thống Quản lý Hội nghị",
    title: "Hệ thống Quản lý Hội nghị",
    description: "Hệ thống quản lý hội nghị chuyên nghiệp với tính năng PWA",
  },
  twitter: {
    card: "summary",
    title: "Hệ thống Quản lý Hội nghị",
    description: "Hệ thống quản lý hội nghị chuyên nghiệp với tính năng PWA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${workSans.variable} ${openSans.variable}`}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hội nghị" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
