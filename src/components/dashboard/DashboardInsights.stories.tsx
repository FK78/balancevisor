import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardInsights } from "./DashboardInsights";

const meta = {
  title: "Dashboard/Insights",
  component: DashboardInsights,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardInsights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedVariants: Story = {
  args: {
    insights: [
      { id: "i1", icon: "trending-up", message: "Your savings rate hit 38% this month — above your 30% target!", variant: "success" },
      { id: "i2", icon: "alert-triangle", message: "Groceries spending is 45% above your 3-month average.", variant: "warning", link: "/dashboard/categories" },
      { id: "i3", icon: "target", message: "Holiday Fund is 60% complete — on track for August.", variant: "info", link: "/dashboard/goals" },
      { id: "i4", icon: "piggy-bank", message: "Emergency fund covers 4.2 months of expenses.", variant: "success" },
    ],
  },
};

export const SingleWarning: Story = {
  args: {
    insights: [
      { id: "i1", icon: "alert-triangle", message: "You have 3 subscriptions renewing tomorrow totalling £42.97.", variant: "warning", link: "/dashboard/subscriptions" },
    ],
  },
};

export const AllSuccess: Story = {
  args: {
    insights: [
      { id: "i1", icon: "trending-up", message: "Net worth grew 8% this quarter.", variant: "success" },
      { id: "i2", icon: "target", message: "All budgets are on track this month.", variant: "success" },
    ],
  },
};
