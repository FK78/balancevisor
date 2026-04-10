import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardSubscriptions } from "./DashboardSubscriptions";

const meta = {
  title: "Dashboard/Subscriptions",
  component: DashboardSubscriptions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardSubscriptions>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date();
const inDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const WithRenewals: Story = {
  args: {
    upcomingRenewals: [
      { id: "s1", name: "Netflix", amount: 15.99, color: "#E50914", next_billing_date: inDays(2) },
      { id: "s2", name: "Spotify", amount: 10.99, color: "#1DB954", next_billing_date: inDays(5) },
      { id: "s3", name: "iCloud+", amount: 2.99, color: "#007AFF", next_billing_date: inDays(9) },
    ],
    subscriptionTotals: { monthly: 85.97, count: 6 },
    currency: "GBP",
  },
};

export const NoUpcoming: Story = {
  args: {
    upcomingRenewals: [],
    subscriptionTotals: { monthly: 45.0, count: 3 },
    currency: "GBP",
  },
};
