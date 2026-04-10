import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SmartBudgetSuggestions } from "./SmartBudgetSuggestions";
import type { BudgetSuggestion } from "@/lib/budget-suggestions";

const meta = {
  title: "Cards/SmartBudgetSuggestions",
  component: SmartBudgetSuggestions,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SmartBudgetSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeSuggestion = (overrides: Partial<BudgetSuggestion>): BudgetSuggestion => ({
  type: "new",
  categoryId: "c1",
  categoryName: "Groceries",
  categoryColor: "#34C759",
  suggestedAmount: 350,
  currentAmount: null,
  avgMonthlySpend: 320,
  reason: "You spend an average of £320/mo on Groceries but have no budget.",
  budgetId: null,
  ...overrides,
});

export const Default: Story = {
  args: {
    currency: "GBP",
    suggestions: [
      makeSuggestion({}),
      makeSuggestion({
        type: "increase",
        categoryId: "c2",
        categoryName: "Transport",
        categoryColor: "#007AFF",
        suggestedAmount: 120,
        currentAmount: 80,
        avgMonthlySpend: 110,
        reason: "Transport spend exceeds budget 3 months running.",
        budgetId: "b2",
      }),
      makeSuggestion({
        type: "decrease",
        categoryId: "c3",
        categoryName: "Entertainment",
        categoryColor: "#AF52DE",
        suggestedAmount: 60,
        currentAmount: 100,
        avgMonthlySpend: 55,
        reason: "Entertainment spend has been well under budget.",
        budgetId: "b3",
      }),
    ],
  },
};

export const Empty: Story = {
  args: { currency: "GBP", suggestions: [] },
};
