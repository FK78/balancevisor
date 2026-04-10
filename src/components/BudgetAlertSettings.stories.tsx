import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BudgetAlertSettings } from "./BudgetAlertSettings";

const meta = {
  title: "Settings/BudgetAlertSettings",
  component: BudgetAlertSettings,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof BudgetAlertSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPrefs: Story = {
  args: {
    budgetId: "b1",
    budgetCategory: "Groceries",
    prefs: null,
  },
};

export const WithPrefs: Story = {
  args: {
    budgetId: "b1",
    budgetCategory: "Groceries",
    prefs: {
      threshold: 80,
      browser_alerts: true,
      email_alerts: false,
    },
  },
};
