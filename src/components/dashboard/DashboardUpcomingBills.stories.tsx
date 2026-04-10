import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardUpcomingBills } from "./DashboardUpcomingBills";

const meta = {
  title: "Dashboard/UpcomingBills",
  component: DashboardUpcomingBills,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardUpcomingBills>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date();
const inDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const makeSub = (id: string, name: string, amount: number, color: string, daysFromNow: number) =>
  ({
    id,
    name,
    amount,
    color,
    next_billing_date: inDays(daysFromNow),
    currency: "GBP",
    billing_cycle: "monthly",
    category_id: null,
    account_id: null,
    categoryName: null,
    categoryColor: null,
    url: null,
    notes: null,
    is_active: true,
    icon: null,
    created_at: new Date(),
  } as any);

export const MultipleRenewals: Story = {
  args: {
    renewals: [
      makeSub("s1", "Netflix", 15.99, "#E50914", 0),
      makeSub("s2", "Spotify", 10.99, "#1DB954", 3),
      makeSub("s3", "iCloud+", 2.99, "#007AFF", 7),
      makeSub("s4", "Gym Membership", 35.0, "#FF9500", 12),
    ],
    currency: "GBP",
  },
};

export const DueToday: Story = {
  args: {
    renewals: [
      makeSub("s1", "Netflix", 15.99, "#E50914", 0),
      makeSub("s2", "Disney+", 10.99, "#113CCF", 0),
    ],
    currency: "GBP",
  },
};
