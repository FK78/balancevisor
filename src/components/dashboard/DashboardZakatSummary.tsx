"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CalendarDays, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

interface DashboardZakatSummaryProps {
  readonly zakatDue: number;
  readonly zakatableAmount: number;
  readonly aboveNisab: boolean;
  readonly daysUntil: number | null;
  readonly hasSettings: boolean;
  readonly baseCurrency: string;
}

export function DashboardZakatSummary({
  zakatDue,
  zakatableAmount,
  aboveNisab,
  daysUntil,
  hasSettings,
  baseCurrency,
}: DashboardZakatSummaryProps) {
  if (!hasSettings) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">Zakat</CardTitle>
                <CardDescription className="text-xs">
                  Set up your zakat anniversary to get started
                </CardDescription>
              </div>
            </div>
            <Link
              href="/dashboard/zakat"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Set up <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Zakat</CardTitle>
              <CardDescription className="text-xs">
                {aboveNisab ? "2.5% of zakatable wealth" : "Below nisab threshold"}
              </CardDescription>
            </div>
          </div>
          <Link
            href="/dashboard/zakat"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Zakat due</span>
          <span className={`text-lg font-bold tabular-nums ${aboveNisab ? "text-emerald-600" : "text-muted-foreground"}`}>
            {formatCurrency(zakatDue, baseCurrency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Zakatable wealth: {formatCurrency(zakatableAmount, baseCurrency)}</span>
          <div className="flex items-center gap-2">
            {daysUntil !== null && (
              <Badge variant={daysUntil <= 7 ? "destructive" : daysUntil <= 30 ? "secondary" : "outline"} className="text-xs">
                <CalendarDays className="mr-1 h-3 w-3" />
                {daysUntil} day{daysUntil !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
