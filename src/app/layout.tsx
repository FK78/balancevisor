import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BalanceVisor",
  description: "BalanceVisor — Track budgets, manage accounts, and take control of your personal finances with real-time spending insights.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BalanceVisor",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F2F7",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("balancevisor-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaInstallPrompt=e})`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system">
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
        <Toaster richColors closeButton position="top-center" className="md:!bottom-4 md:!top-auto md:!right-4 md:!left-auto" />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
