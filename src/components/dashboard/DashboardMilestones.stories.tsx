import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardMilestones } from "./DashboardMilestones";
import type { Milestone } from "@/lib/milestones";

const meta = {
  title: "Dashboard/Milestones",
  component: DashboardMilestones,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardMilestones>;

export default meta;
type Story = StoryObj<typeof meta>;

const regular: Milestone[] = [
  { kind: "net_worth_growth", title: "Net Worth +34%", subtitle: "Grew from £32k to £43k this year", stat: "+34%", detail: null, accent: "emerald", achievedAt: "2026-04-01" },
  { kind: "goal_completed", title: "Holiday Fund Complete", subtitle: "Saved the full £3,000 target", stat: "£3,000", detail: null, accent: "blue", achievedAt: "2026-03-15" },
  { kind: "savings_streak", title: "6-Month Savings Streak", subtitle: "Positive savings for 6 consecutive months", stat: "6 months", detail: null, accent: "violet", achievedAt: "2026-04-10" },
];

const funny: Milestone[] = [
  { kind: "funny", title: "Coffee Connoisseur", subtitle: "Your top micro-spend category", stat: "£142", detail: "That's roughly 47 flat whites this month.", accent: "rose", achievedAt: "2026-04-01", funnyPattern: "coffee_addict" },
  { kind: "funny", title: "Weekend Warrior", subtitle: "78% of entertainment spend is Fri-Sun", stat: "78%", detail: "Weekdays are for saving, weekends are for living.", accent: "rose", achievedAt: "2026-04-05", funnyPattern: "weekend_warrior" },
];

export const MixedMilestones: Story = {
  args: {
    milestones: [...regular, ...funny],
    displayName: "Fahad",
  },
};

export const RegularOnly: Story = {
  args: {
    milestones: regular,
    displayName: "Fahad",
  },
};

export const FunnyOnly: Story = {
  args: {
    milestones: funny,
    displayName: "Fahad",
  },
};
