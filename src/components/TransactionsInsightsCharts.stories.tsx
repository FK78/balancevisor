import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TransactionsInsightsCharts } from "./TransactionsInsightsCharts";

const meta = {
  title: "Charts/TransactionsInsightsCharts",
  component: TransactionsInsightsCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionsInsightsCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateDays = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    const inc = i % 7 === 0 ? 500 : Math.round(Math.random() * 50);
    const exp = Math.round(20 + Math.random() * 80);
    return {
      day: d.toISOString().slice(0, 10),
      date: d.toISOString().slice(0, 10),
      income: inc,
      expenses: exp,
      refunds: 0,
      net: inc - exp,
    };
  });

const CATS = ["Groceries", "Transport", "Eating Out", "Shopping"];
const COLORS = ["#34C759", "#007AFF", "#FF9500", "#FF2D55"];

const generateCategoryExpenses = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    const cat = CATS[i % CATS.length];
    return {
      day: d.toISOString().slice(0, 10),
      date: d.toISOString().slice(0, 10),
      category: cat,
      category_id: `c${i % CATS.length}`,
      color: COLORS[i % CATS.length],
      total: Math.round(10 + Math.random() * 60),
    };
  });

export const Default: Story = {
  args: {
    dailyTrend: generateDays(30),
    dailyCategoryExpenses: generateCategoryExpenses(30),
    currency: "GBP",
  },
};
