import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardBillTimeline } from "./DashboardBillTimeline";

const meta = {
  title: "Dashboard/BillTimeline",
  component: DashboardBillTimeline,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardBillTimeline>;

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

export const AllGroups: Story = {
  args: {
    renewals: [
      makeSub("s1", "Netflix", 15.99, "#E50914", 0),
      makeSub("s2", "Spotify", 10.99, "#1DB954", 1),
      makeSub("s3", "iCloud+", 2.99, "#007AFF", 4),
      makeSub("s4", "Gym", 35.0, "#FF9500", 6),
      makeSub("s5", "Car Insurance", 120.0, "#AF52DE", 14),
    ],
    currency: "GBP",
  },
};

export const TodayOnly: Story = {
  args: {
    renewals: [
      makeSub("s1", "Netflix", 15.99, "#E50914", 0),
      makeSub("s2", "Disney+", 10.99, "#113CCF", 0),
    ],
    currency: "GBP",
  },
};
