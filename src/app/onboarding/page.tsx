import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OnboardingCategoryForm } from "@/components/OnboardingCategoryForm";
import { getCurrentUserId } from "@/lib/auth";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getDebts } from "@/db/queries/debts";
import { getSubscriptions } from "@/db/queries/subscriptions";
import { getTrading212Connection, getManualHoldings } from "@/db/queries/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getDefaultCategoryTemplates, getOnboardingState } from "@/db/queries/onboarding";
import { addAccount } from "@/db/mutations/accounts";
import { addCategory } from "@/db/mutations/categories";
import {
  completeOnboarding,
  continueFromCategories,
  setBaseCurrency,
  skipOnboarding,
} from "@/db/mutations/onboarding";
import { normalizeBaseCurrency, SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { AccountQuickAdd } from "@/components/AccountQuickAdd";
import { CategorySelector } from "@/components/CategorySelector";
import { FeaturesStep } from "@/components/FeaturesStep";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

type Step = "welcome" | "accounts" | "categories" | "features" | "review";

const currencyLabels: Record<(typeof SUPPORTED_BASE_CURRENCIES)[number], string> = {
  GBP: "British Pound (\u00a3)",
  USD: "US Dollar ($)",
  EUR: "Euro (\u20ac)",
  CAD: "Canadian Dollar (CA$)",
  AUD: "Australian Dollar (A$)",
};

const ALL_STEPS: Step[] = ["welcome", "accounts", "categories", "features", "review"];

const STEP_NAMES: Record<Step, string> = {
  welcome: "Welcome",
  accounts: "Accounts",
  categories: "Categories",
  features: "Features",
  review: "Review",
};

function normalizeStep(value?: string): Step {
  if (ALL_STEPS.includes(value as Step)) return value as Step;
  return "welcome";
}

async function addOnboardingAccount(formData: FormData) {
  "use server";
  await addAccount(formData);
}

async function addOnboardingCategory(formData: FormData) {
  "use server";
  await addCategory(formData);
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string }>;
}) {
  const userId = await getCurrentUserId();
  const resolvedSearchParams = await searchParams;
  const step = normalizeStep(resolvedSearchParams?.step);

  const [onboardingState, accounts, categories, budgets, goals, debts, subscriptions, defaultTemplates] =
    await Promise.all([
      getOnboardingState(userId),
      getAccountsWithDetails(userId),
      getCategoriesByUser(userId),
      getBudgets(userId),
      getGoals(userId),
      getDebts(userId),
      getSubscriptions(userId),
      getDefaultCategoryTemplates(),
      getTrading212Connection(userId),
      getManualHoldings(userId),
      getGroupsByUser(userId),
    ]);

  if (onboardingState?.completed) {
    redirect("/dashboard");
  }

  const defaultCategoryPreference = onboardingState?.use_default_categories ?? false;
  const baseCurrency = normalizeBaseCurrency(onboardingState?.base_currency);

  const currentStepIndex = ALL_STEPS.indexOf(step);

  const navigateToStep = (targetStep: Step) => {
    return `/onboarding?step=${targetStep}`;
  };

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={ALL_STEPS.length}
      stepName={STEP_NAMES[step]}
      skipHref="/dashboard"
      canSkip={step !== "welcome"}
    >
      {/* Welcome Step */}
      {step === "welcome" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to BalanceVisor</CardTitle>
            <CardDescription className="text-base">
              {"Let's get your finances set up in just a few quick steps."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                First, choose your base currency. All amounts in the app will use this currency.
              </p>
              <form action={setBaseCurrency} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="base_currency">Base Currency</Label>
                  <select
                    id="base_currency"
                    name="base_currency"
                    className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                    defaultValue={baseCurrency}
                  >
                    {SUPPORTED_BASE_CURRENCIES.map((currencyCode) => (
                      <option key={currencyCode} value={currencyCode}>
                        {currencyLabels[currencyCode]}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Save {"&"} Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="text-center">
              <form action={skipOnboarding}>
                <Button type="submit" variant="link" className="text-muted-foreground">
                  Skip setup and go to dashboard
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Step */}
      {step === "accounts" && (
        <Card>
          <CardHeader>
            <CardTitle>Add your accounts</CardTitle>
            <CardDescription>
              Add the accounts you want to track. You can always add more later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addOnboardingAccount} className="hidden">
              <input type="hidden" name="name" id="hidden-name" />
              <input type="hidden" name="type" id="hidden-type" />
              <input type="hidden" name="balance" id="hidden-balance" />
            </form>

            <AccountQuickAdd
              currency={baseCurrency}
              onAddAccount={async (data) => {
                "use server";
                const formData = new FormData();
                formData.set("name", data.name);
                formData.set("type", data.type);
                formData.set("balance", data.balance);
                await addAccount(formData);
              }}
              existingAccounts={accounts}
            />

            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link href={navigateToStep("categories")}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {accounts.length === 0 && (
                <Button asChild variant="outline">
                  <Link href={navigateToStep("categories")}>
                    Skip for now
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Step */}
      {step === "categories" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set up categories</CardTitle>
              <CardDescription>
                Categories help you organize and track your spending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategorySelector
                templates={defaultTemplates}
                existingCategories={categories}
                onAddDefaults={async () => {
                  "use server";
                  const formData = new FormData();
                  formData.set("use_default_categories", "on");
                  formData.set("intent", "apply");
                  await continueFromCategories(formData);
                }}
                canAddDefaults={categories.length < defaultTemplates.length}
              />

              <form action={continueFromCategories} className="flex flex-wrap gap-2">
                <input type="hidden" name="use_default_categories" value={defaultCategoryPreference ? "on" : ""} />
                <Button type="submit" name="intent" value="continue">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {categories.length === 0 && (
                  <Button type="submit" name="intent" value="continue" variant="outline">
                    Skip for now
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add custom category</CardTitle>
              <CardDescription>
                Create your own categories with custom colors and icons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingCategoryForm action={addOnboardingCategory} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Step */}
      {step === "features" && (
        <FeaturesStep />
      )}

      {/* Review Step */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>{"You're all set!"}</CardTitle>
            <CardDescription>
              {"Here's a summary of what you've set up."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{accounts.length}</p>
                <p className="text-muted-foreground text-xs">Accounts</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{categories.length}</p>
                <p className="text-muted-foreground text-xs">Categories</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{budgets.length}</p>
                <p className="text-muted-foreground text-xs">Budgets</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{goals.length}</p>
                <p className="text-muted-foreground text-xs">Goals</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{debts.length}</p>
                <p className="text-muted-foreground text-xs">Debts</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold">{subscriptions.length}</p>
                <p className="text-muted-foreground text-xs">Subscriptions</p>
              </div>
            </div>

            <p className="text-muted-foreground text-sm text-center">
              You can always add more from the dashboard.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={completeOnboarding} className="flex-1">
                <Button type="submit" className="w-full">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <Button asChild variant="outline" className="sm:w-auto">
                <Link href={navigateToStep("accounts")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to start
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </OnboardingLayout>
  );
}
