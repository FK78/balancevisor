import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { AuthButton } from "@/components/AuthButton";
import { NotificationBellServer } from "@/components/NotificationBellServer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentUserId } from "@/lib/auth";
import { hasCompletedOnboarding, getPendingFeatures } from "@/db/queries/onboarding";
import { generateDueRecurringTransactions } from "@/lib/recurring-transactions";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AiSettingsProvider } from "@/components/AiSettingsProvider";
import { ChatPanelWrapper as ChatPanel } from "@/components/ChatPanelWrapper";
import { BankSyncTrigger } from "@/components/BankSyncTrigger";
import { NextFeatureButtonClient } from "@/components/NextFeatureButtonClient";
import { isAiEnabled } from "@/db/queries/preferences";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();
  const [onboardingComplete, pendingFeatures, , aiEnabled] = await Promise.all([
    hasCompletedOnboarding(userId),
    getPendingFeatures(userId),
    generateDueRecurringTransactions(userId),
    isAiEnabled(userId),
  ]);

  if (!onboardingComplete) {
    redirect("/onboarding");
  }

  const pendingFeaturesList: string[] = pendingFeatures ? JSON.parse(pendingFeatures) : [];

  return (
    <AiSettingsProvider aiEnabled={aiEnabled}>
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl" style={{ borderBottom: '0.5px solid var(--border)' }}>
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-4 px-4 md:h-12 md:gap-6 md:px-10">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
            >
              <Image src="/logo.svg" alt="BalanceVisor logo" width={30} height={30} />
              <span className="hidden sm:inline">BalanceVisor</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-1.5">
            <ChatPanel />
            <ThemeToggle />
            <Suspense>
              <NotificationBellServer />
            </Suspense>
            <div className="hidden md:block">
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
      <div className="pb-20 md:pb-0">
        {children}
      </div>
      <MobileBottomNav />
      <InstallPrompt />
      <BankSyncTrigger />
      {pendingFeaturesList.length > 0 && (
        <NextFeatureButtonClient pendingFeatures={pendingFeaturesList} />
      )}
    </div>
    </AiSettingsProvider>
  );
}
