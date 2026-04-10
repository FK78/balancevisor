import type { Decorator } from "@storybook/nextjs-vite";
import { ReportsProvider } from "./ReportsProvider";

const MOCK_MONTHLY_TREND = [
  { month: "2025-11", income: 3400, expenses: 2600, refunds: 0, net: 800 },
  { month: "2025-12", income: 3800, expenses: 3200, refunds: 0, net: 600 },
  { month: "2026-01", income: 3600, expenses: 2400, refunds: 0, net: 1200 },
  { month: "2026-02", income: 3600, expenses: 2800, refunds: 0, net: 800 },
  { month: "2026-03", income: 3800, expenses: 2300, refunds: 0, net: 1500 },
  { month: "2026-04", income: 3200, expenses: 2600, refunds: 0, net: 600 },
  { month: "2026-05", income: 3600, expenses: 2100, refunds: 0, net: 1500 },
  { month: "2026-06", income: 3800, expenses: 2500, refunds: 0, net: 1300 },
  { month: "2026-07", income: 3600, expenses: 2700, refunds: 0, net: 900 },
  { month: "2026-08", income: 3800, expenses: 2200, refunds: 0, net: 1600 },
  { month: "2026-09", income: 3600, expenses: 2900, refunds: 0, net: 700 },
  { month: "2026-10", income: 3800, expenses: 2400, refunds: 0, net: 1400 },
];

const CATEGORIES = [
  { name: "Groceries", color: "#34C759" },
  { name: "Transport", color: "#007AFF" },
  { name: "Eating Out", color: "#FF9500" },
  { name: "Entertainment", color: "#AF52DE" },
  { name: "Shopping", color: "#FF2D55" },
  { name: "Bills", color: "#5856D6" },
];

const MOCK_CATEGORY_SPEND = MOCK_MONTHLY_TREND.flatMap((m) =>
  CATEGORIES.map((cat, i) => ({
    month: m.month,
    category: cat.name,
    category_id: `cat-${i}`,
    color: cat.color,
    total: Math.round((m.expenses / CATEGORIES.length) * (1 + (i % 3) * 0.2)),
  })),
);

export const reportsDecorator: Decorator = (Story) => (
  <ReportsProvider
    monthlyTrend={MOCK_MONTHLY_TREND}
    monthlyCategorySpend={MOCK_CATEGORY_SPEND}
    currency="GBP"
  >
    <div className="w-[600px]">
      <Story />
    </div>
  </ReportsProvider>
);
