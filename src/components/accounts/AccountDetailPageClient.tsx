import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ActionShelf,
  CockpitHero,
  PriorityStack,
} from "@/components/ui/cockpit";

interface AccountDetailPageClientProps {
  readonly breadcrumbHref: string;
  readonly breadcrumbLabel?: string;
  readonly accountName: string;
  readonly heroAside?: ReactNode;
  readonly heroAction?: ReactNode;
  readonly actionShelf: ReactNode;
  readonly priorityCards: ReactNode;
  readonly activity: ReactNode;
}

export function AccountDetailPageClient({
  breadcrumbHref,
  breadcrumbLabel = "Accounts",
  accountName,
  heroAside,
  heroAction,
  actionShelf,
  priorityCards,
  activity,
}: AccountDetailPageClientProps) {
  return (
    <div className="cockpit-page mx-auto max-w-7xl px-4 py-6 md:px-10 md:py-10">
      <div className="space-y-6 md:space-y-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-1 px-2 text-muted-foreground">
            <Link href={breadcrumbHref}>
              <ChevronLeft className="h-4 w-4" />
              {breadcrumbLabel}
            </Link>
          </Button>
        </div>

        <CockpitHero
          eyebrow="Account"
          title="Keep this account in clear view"
          description={`${accountName} gets a focused status summary first, then the activity workspace stays nearby so you can act without losing context.`}
          action={heroAction}
          aside={heroAside ? (
            <div className="space-y-3">
              <div>
                <p className="cockpit-kicker text-[10px] text-white/70">Watching</p>
                <p className="text-lg font-semibold text-white">{accountName}</p>
              </div>
              {heroAside}
            </div>
          ) : null}
        />

        <ActionShelf
          eyebrow="Next step"
          title="Work from the account context, not around it"
          description="Share, edit, or tidy the account here so the activity feed below can stay focused on what changed."
        >
          {actionShelf}
        </ActionShelf>

        <PriorityStack
          eyebrow="Decision support"
          title="Use the account signals before drilling into line items"
          description="These summaries keep balance pressure, cash flow, and risk visible while you work through recent activity."
        >
          {priorityCards}
        </PriorityStack>

        <section className="space-y-4">
          <div className="space-y-1">
            <p className="cockpit-kicker">Activity workspace</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Review recent movements without leaving this account.
            </h2>
          </div>
          {activity}
        </section>
      </div>
    </div>
  );
}
