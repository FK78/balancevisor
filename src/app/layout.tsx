import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Toaster } from "sonner";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-app-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-app-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wealth",
  description: "Wealth — Track budgets, manage accounts, and take control of your personal finances with real-time spending insights.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wealth",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} app-body antialiased`}>
        <ThemeProvider defaultTheme="system">
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
        <Toaster richColors closeButton position="bottom-right" className="!bottom-20 md:!bottom-4" />
        <PullToRefresh />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
