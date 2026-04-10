import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardNudgeFeed } from "./DashboardNudgeFeed";
import type { Nudge } from "@/lib/nudges/types";

const meta = {
  title: "Dashboard/DashboardNudgeFeed",
  component: DashboardNudgeFeed,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardNudgeFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNudges: readonly Nudge[] = [
  {
    id: "n1",
    category: "watch",
    title: "Groceries budget 85%",
    body: "You've used 85% of your Groceries budget with 8 days left this month.",
    actionUrl: "/dashboard/budgets",
    actionLabel: "View budgets",
    priority: 90,
    icon: "alert-triangle",
    dismissible: true,
  },
  {
    id: "n2",
    category: "save",
    title: "Cancel unused subscription?",
    body: "You haven't used your Audible subscription in 3 months — that's £24 saved if you cancel.",
    actionUrl: "/dashboard/subscriptions",
    actionLabel: "Review",
    priority: 80,
    icon: "scissors",
    savingsEstimate: 24,
    dismissible: true,
  },
  {
    id: "n3",
    category: "celebrate",
    title: "6-month savings streak!",
    body: "You've saved money every month for 6 months running. Keep it up!",
    priority: 70,
    icon: "party-popper",
    dismissible: false,
  },
  {
    id: "n4",
    category: "info",
    title: "New feature: Debt payoff planner",
    body: "Compare snowball vs avalanche strategies to pay off your debts faster.",
    actionUrl: "/dashboard/debts",
    actionLabel: "Try it",
    priority: 50,
    icon: "info",
    dismissible: true,
  },
];

export const Default: Story = {
  args: { nudges: mockNudges },
};

export const Empty: Story = {
  args: { nudges: [] },
};
