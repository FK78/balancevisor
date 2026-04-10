import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import { getZakatSettings, getZakatCalculations, getLatestZakatCalculation } from "@/db/queries/zakat";
import { ZakatSettingsDialog } from "@/components/ZakatSettingsDialog";
import { CalculateZakatButton } from "@/components/CalculateZakatButton";
import {
  Calculator,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  Scale,
  CheckCircle2,
  AlertTriangle,
  History,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ZakatPage() {
  const userId = await getCurrentUserId();
  const [settings, baseCurrency, latest, history] = await Promise.all([
    getZakatSettings(userId),
    getUserBaseCurrency(userId),
    getLatestZakatCalculation(userId),
    getZakatCalculations(userId, 10),
  ]);

  // Calculate days until anniversary
  let daysUntil: number | null = null;
  let nextAnniversary: string | null = null;
  if (settings) {
    const today = new Date();
    const anniv = new Date(settings.anniversary_date);
    const thisYearAnniv = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
    if (thisYearAnniv <= today) {
      thisYearAnniv.setFullYear(thisYearAnniv.getFullYear() + 1);
    }
    daysUntil = Math.ceil((thisYearAnniv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    nextAnniversary = thisYearAnniv.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Parse breakdown JSON from latest calculation
  let breakdownAccounts: { name: string; type: string | null; balance: number }[] = [];
  let breakdownDebts: { name: string; remainingAmount: number }[] = [];
  if (latest?.breakdown_json) {
    const parsed = latest.breakdown_json as { accounts?: typeof breakdownAccounts; debts?: typeof breakdownDebts };
    breakdownAccounts = parsed.accounts ?? [];
    breakdownDebts = parsed.debts ?? [];
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Zakat Calculator</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Calculate your annual zakat obligation based on your assets and liabilities.
          </p>
        </div>
        <div className="flex gap-2">
          <ZakatSettingsDialog
            settings={
              settings
                ? {
                    anniversary_date: settings.anniversary_date,
                    nisab_type: settings.nisab_type,
                    use_lunar_calendar: settings.use_lunar_calendar,
                  }
                : null
            }
            baseCurrency={baseCurrency}
          />
          {settings && <CalculateZakatButton />}
        </div>
      </div>

      {/* No settings yet */}
      {!settings && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium">No zakat anniversary set</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Set your zakat anniversary date to get started. Your zakat will be
              automatically calculated 1 day before it&apos;s due.
            </p>
            <ZakatSettingsDialog settings={null} baseCurrency={baseCurrency} />
          </CardContent>
        </Card>
      )}

      {/* Anniversary countdown */}
      {settings && daysUntil !== null && (
        <Card className="bg-gradient-to-br from-emerald-500/6 via-teal-500/4 to-cyan-400/6 border-emerald-500/15">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CalendarDays className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Zakat Anniversary</p>
                <p className="text-2xl font-bold tabular-nums">
                  {daysUntil}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    day{daysUntil !== 1 ? "s" : ""} away
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{nextAnniversary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={daysUntil <= 7 ? "destructive" : daysUntil <= 30 ? "secondary" : "outline"}>
                {daysUntil <= 1 ? "Due tomorrow!" : daysUntil <= 7 ? "Due this week" : daysUntil <= 30 ? "Due this month" : "Upcoming"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {settings.nisab_type} nisab
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest calculation result */}
      {latest && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-semibold">Total Assets</CardDescription>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl text-emerald-600">
                  {formatCurrency(latest.total_assets, baseCurrency)}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">Cash, savings &amp; investments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-semibold">Deductions</CardDescription>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl text-red-600">
                  {formatCurrency(latest.total_liabilities + latest.debt_deductions, baseCurrency)}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">Liabilities &amp; debts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-semibold">Zakatable Wealth</CardDescription>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Scale className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {formatCurrency(latest.zakatable_amount, baseCurrency)}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">
                  Nisab: {formatCurrency(latest.nisab_value, baseCurrency)} —{" "}
                  {latest.above_nisab ? "Above" : "Below"}
                </p>
              </CardContent>
            </Card>

            <Card className={latest.above_nisab ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-semibold">Zakat Due</CardDescription>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${latest.above_nisab ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"}`}>
                  <Calculator className={`h-4 w-4 ${latest.above_nisab ? "text-emerald-600" : "text-muted-foreground"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className={`text-2xl ${latest.above_nisab ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {formatCurrency(latest.zakat_due, baseCurrency)}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">
                  {latest.above_nisab ? "2.5% of zakatable wealth" : "Below nisab — no zakat due"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Nisab status banner */}
          <Card className={latest.above_nisab ? "border-emerald-500/20" : "border-amber-500/20"}>
            <CardContent className="flex items-center gap-3 py-4">
              {latest.above_nisab ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Your wealth is above the nisab threshold</p>
                    <p className="text-xs text-muted-foreground">
                      You are obligated to pay <strong>{formatCurrency(latest.zakat_due, baseCurrency)}</strong> in zakat (2.5% of {formatCurrency(latest.zakatable_amount, baseCurrency)}).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Your wealth is below the nisab threshold</p>
                    <p className="text-xs text-muted-foreground">
                      No zakat is due at this time. Nisab is {formatCurrency(latest.nisab_value, baseCurrency)}, your zakatable wealth is {formatCurrency(latest.zakatable_amount, baseCurrency)}.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Detailed breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Assets breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4" />
                  Assets Breakdown
                </CardTitle>
                <CardDescription>Accounts contributing to zakatable wealth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {breakdownAccounts.length > 0 ? (
                  <>
                    {breakdownAccounts
                      .filter((a) => a.type !== "creditCard")
                      .map((account, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="truncate max-w-[200px]">{account.name}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {account.type?.replace(/([A-Z])/g, " $1").trim() ?? "Account"}
                            </Badge>
                          </div>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(account.balance, baseCurrency)}
                          </span>
                        </div>
                      ))}
                    {latest.investment_value > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-400" />
                          <span>Investments</span>
                          <Badge variant="outline" className="text-xs">Portfolio</Badge>
                        </div>
                        <span className="tabular-nums font-medium">
                          {formatCurrency(latest.investment_value, baseCurrency)}
                        </span>
                      </div>
                    )}
                    {latest.other_assets_value > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-400" />
                          <span>Other Assets</span>
                          <Badge variant="outline" className="text-xs">Zakatable</Badge>
                        </div>
                        <span className="tabular-nums font-medium">
                          {formatCurrency(latest.other_assets_value, baseCurrency)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
                      <span>Total Assets</span>
                      <span className="tabular-nums text-emerald-600">
                        {formatCurrency(latest.total_assets, baseCurrency)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No account data in this calculation.</p>
                )}
              </CardContent>
            </Card>

            {/* Liabilities breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Deductions Breakdown
                </CardTitle>
                <CardDescription>Liabilities and debts reducing zakatable wealth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {breakdownAccounts
                  .filter((a) => a.type === "creditCard")
                  .map((account, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="truncate max-w-[200px]">{account.name}</span>
                        <Badge variant="outline" className="text-xs">Credit Card</Badge>
                      </div>
                      <span className="tabular-nums font-medium text-red-600">
                        {formatCurrency(Math.abs(account.balance), baseCurrency)}
                      </span>
                    </div>
                  ))}
                {breakdownDebts.map((debt, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="truncate max-w-[200px]">{debt.name}</span>
                      <Badge variant="outline" className="text-xs">Debt</Badge>
                    </div>
                    <span className="tabular-nums font-medium text-red-600">
                      {formatCurrency(debt.remainingAmount, baseCurrency)}
                    </span>
                  </div>
                ))}
                {(breakdownAccounts.filter((a) => a.type === "creditCard").length === 0 &&
                  breakdownDebts.length === 0) && (
                  <p className="text-xs text-muted-foreground">No liabilities or debts to deduct.</p>
                )}
                {(latest.total_liabilities + latest.debt_deductions > 0) && (
                  <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
                    <span>Total Deductions</span>
                    <span className="tabular-nums text-red-600">
                      {formatCurrency(latest.total_liabilities + latest.debt_deductions, baseCurrency)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calculation formula summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Zakat Formula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Cash &amp; Savings</p>
                  <p className="font-bold tabular-nums">{formatCurrency(latest.cash_and_savings, baseCurrency)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">+ Investments</p>
                  <p className="font-bold tabular-nums">{formatCurrency(latest.investment_value, baseCurrency)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">+ Other Assets</p>
                  <p className="font-bold tabular-nums">{formatCurrency(latest.other_assets_value, baseCurrency)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">− Deductions</p>
                  <p className="font-bold tabular-nums text-red-600">
                    {formatCurrency(latest.total_liabilities + latest.debt_deductions, baseCurrency)}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">= Zakat Due (2.5%)</p>
                  <p className="font-bold tabular-nums text-emerald-600">
                    {formatCurrency(latest.zakat_due, baseCurrency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No calculation yet but settings exist */}
      {settings && !latest && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Calculator className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium">No zakat calculation yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your zakat will be automatically calculated 1 day before your anniversary.
              You can also calculate it manually at any time.
            </p>
            <CalculateZakatButton />
          </CardContent>
        </Card>
      )}

      {/* Calculation history */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Calculation History
            </CardTitle>
            <CardDescription>Previous zakat calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${calc.above_nisab ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <div>
                      <p className="font-medium">
                        {new Date(calc.calculated_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {calc.is_auto ? "Auto-calculated" : "Manual"} · Zakatable: {formatCurrency(calc.zakatable_amount, baseCurrency)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold tabular-nums ${calc.above_nisab ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {formatCurrency(calc.zakat_due, baseCurrency)}
                    </p>
                    <Badge variant={calc.above_nisab ? "default" : "secondary"} className="text-xs">
                      {calc.above_nisab ? "Above nisab" : "Below nisab"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
