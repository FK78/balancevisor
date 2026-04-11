import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { AuthButton } from "@/components/AuthButton";
import { NotificationBellServer } from "@/components/NotificationBellServer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsLink } from "@/components/SettingsLink";
import { getCurrentUserId, isCurrentRequestMockAuthEnabled } from "@/lib/auth";
import { hasCompletedOnboarding, getPendingFeatures } from "@/db/queries/onboarding";
import { generateDueRecurringTransactions } from "@/lib/recurring-transactions";
import { autoCalculateZakatIfDue } from "@/lib/zakat-auto-check";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AiSettingsProvider } from "@/components/AiSettingsProvider";
import { ChatPanelWrapper as ChatPanel } from "@/components/ChatPanelWrapper";
import { BankSyncTrigger } from "@/components/BankSyncTrigger";
import { EnrichmentTrigger } from "@/components/EnrichmentTrigger";
import { NextFeatureButtonClient } from "@/components/NextFeatureButtonClient";
import { isAiEnabled, getDisabledFeatures } from "@/db/queries/preferences";
import { hasTrueLayerConnection } from "@/db/queries/truelayer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FeatureFlagsProvider } from "@/components/FeatureFlagsProvider";
import { logger } from "@/lib/logger";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();
  const [isMockRequest, onboardingComplete, pendingFeatures, aiEnabled, disabledFeatures, hasBankConnection] = await Promise.all([
    isCurrentRequestMockAuthEnabled(),
    hasCompletedOnboarding(userId),
    getPendingFeatures(userId),
    isAiEnabled(userId),
    getDisabledFeatures(userId),
    hasTrueLayerConnection(userId),
  ]);

  // Fire-and-forget: write ops that don't produce data needed for rendering
  generateDueRecurringTransactions(userId).catch((err) => logger.warn('dashboard-layout', 'recurring generation failed', err));
  autoCalculateZakatIfDue(userId).catch((err) => logger.warn('dashboard-layout', 'zakat auto-check failed', err));

  if (!onboardingComplete && !isMockRequest) {
    redirect("/onboarding");
  }

  const pendingFeaturesList: string[] = pendingFeatures ?? [];

  return (
    <AiSettingsProvider aiEnabled={aiEnabled}>
    <FeatureFlagsProvider disabledFeatures={disabledFeatures}>
    <div className="dashboard-shell-bg min-h-screen bg-[var(--workspace-canvas)]">
      <nav className="sticky top-0 z-50 border-b border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--background)_88%,var(--card)_12%)]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 md:min-h-[4.5rem] md:gap-6 md:px-10">
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-full px-1 py-1 text-base font-semibold tracking-tight md:text-lg"
            >
              <Image src="/logo.svg" alt="Wealth logo" width={30} height={30} />
              <span className="hidden sm:inline">Wealth</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-1.5">
            <EnrichmentTrigger />
            <ChatPanel />
            <SettingsLink />
            <ThemeToggle />
            <Suspense>
              <NotificationBellServer />
            </Suspense>
            <div className="hidden xl:block">
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
      <div className="pb-28 xl:pb-0">
        {children}
      </div>
      <MobileBottomNav />
      <InstallPrompt />
      <BankSyncTrigger enabled={hasBankConnection} />
      {pendingFeaturesList.length > 0 && (
        <NextFeatureButtonClient pendingFeatures={pendingFeaturesList} />
      )}
    </div>
    </FeatureFlagsProvider>
    </AiSettingsProvider>
  );
}
