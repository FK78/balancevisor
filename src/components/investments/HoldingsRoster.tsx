import type { ReactNode } from "react";

import { DecisionRow } from "@/components/dense-data/DecisionRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";

export type HoldingsRosterHolding = {
  readonly id: string;
  readonly ticker: string | null;
  readonly name: string;
  readonly quantity: number;
  readonly value: number;
  readonly interpretation: string | null;
  readonly contextLabel: string;
  readonly sourceLabel?: string;
  readonly currentPriceLabel?: string;
  readonly gainLossLabel?: string;
  readonly gainLossTone?: "neutral" | "positive" | "negative" | "warning";
  readonly actions?: ReactNode;
};

export type HoldingsRosterGroup = {
  readonly id: string | null;
  readonly title: string;
  readonly holdings: readonly HoldingsRosterHolding[];
  readonly actions?: ReactNode;
};

export type HoldingsRosterSection = {
  readonly accountId: string | null;
  readonly accountName: string | null;
  readonly groups: readonly HoldingsRosterGroup[];
};

type HoldingsRosterProps = {
  readonly accountSections: readonly HoldingsRosterSection[];
  readonly currency: string;
};

function formatQuantity(quantity: number) {
  return `${quantity.toLocaleString("en-GB", {
    minimumFractionDigits: Number.isInteger(quantity) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(quantity) ? 0 : 4,
  })} shares`;
}

export function HoldingsRoster({ accountSections, currency }: HoldingsRosterProps) {
  return (
    <div className="space-y-6">
      {accountSections.map((section) => {
        const visibleGroups = section.groups.filter(
          (group) => group.holdings.length > 0 || group.id !== null,
        );
        const flattenedHoldings = visibleGroups.flatMap((group) => group.holdings);
        const holdingCount = flattenedHoldings.length;
        const groupedCount = visibleGroups.filter((group) => group.id).length;

        return (
          <section
            key={section.accountId ?? "unlinked"}
            className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm md:p-6"
          >
            <header className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.accountName ?? "Unlinked holdings"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {holdingCount} holding{holdingCount === 1 ? "" : "s"}
                  {groupedCount > 0 ? ` across ${groupedCount} group${groupedCount === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(
                  flattenedHoldings.reduce((sum, holding) => sum + holding.value, 0),
                  currency,
                )} total
              </p>
            </header>

            <div data-testid="holdings-roster-mobile" className="space-y-5 pt-5 md:hidden">
              {visibleGroups.map((group) => (
                <div key={group.id ?? "ungrouped"} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        {group.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.holdings.length} holding{group.holdings.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {group.actions ? <div className="shrink-0">{group.actions}</div> : null}
                  </div>

                  {group.holdings.length > 0 ? (
                    <div className="space-y-3">
                      {group.holdings.map((holding) => (
                        <DecisionRow
                          key={holding.id}
                          title={holding.name}
                          amount={formatCurrency(holding.value, currency)}
                          amountTone={holding.gainLossTone}
                          statusLabel={holding.ticker ?? undefined}
                          meta={[
                            formatQuantity(holding.quantity),
                            holding.contextLabel,
                            holding.sourceLabel ?? "",
                            holding.currentPriceLabel ?? "",
                            holding.gainLossLabel ?? "",
                          ]}
                          interpretation={holding.interpretation ?? undefined}
                          action={holding.actions}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No holdings in this group yet.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden pt-5 md:block">
              <div className="space-y-5">
                {visibleGroups.map((group) => (
                  <div key={group.id ?? "ungrouped"} className="space-y-3">
                    {group.id !== null || visibleGroups.length > 1 ? (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold tracking-tight text-foreground">
                            {group.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.holdings.length} holding{group.holdings.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        {group.actions ? <div className="shrink-0">{group.actions}</div> : null}
                      </div>
                    ) : null}

                    {group.holdings.length > 0 ? (
                      <Table aria-label="Holdings comparison">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Holding</TableHead>
                            <TableHead>Context</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>Reading</TableHead>
                            <TableHead>Gain / Loss</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.holdings.map((holding) => (
                            <TableRow key={holding.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{holding.name}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {holding.ticker ? <span>{holding.ticker}</span> : null}
                                    {holding.sourceLabel ? <span>{holding.sourceLabel}</span> : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>{holding.contextLabel}</p>
                                  {holding.currentPriceLabel ? <p>{holding.currentPriceLabel}</p> : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                                {holding.quantity.toLocaleString("en-GB", {
                                  minimumFractionDigits: Number.isInteger(holding.quantity) ? 0 : 2,
                                  maximumFractionDigits: Number.isInteger(holding.quantity) ? 0 : 4,
                                })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium text-foreground">
                                {formatCurrency(holding.value, currency)}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  {holding.interpretation ? <p>{holding.interpretation}</p> : <p>Data current - no action needed</p>}
                                </div>
                              </TableCell>
                              <TableCell>
                                {holding.gainLossLabel ? (
                                  <p
                                    className={
                                      holding.gainLossTone === "positive"
                                        ? "text-sm text-emerald-700 dark:text-emerald-400"
                                        : holding.gainLossTone === "negative"
                                          ? "text-sm text-rose-700 dark:text-rose-400"
                                          : holding.gainLossTone === "warning"
                                            ? "text-sm text-amber-700 dark:text-amber-400"
                                            : "text-sm text-muted-foreground"
                                    }
                                  >
                                    {holding.gainLossLabel}
                                  </p>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Waiting for gain data</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {holding.actions ? (
                                  <div className="flex justify-end">{holding.actions}</div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No actions</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        No holdings in this group yet.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
