import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareSnapshotCard } from "./ShareSnapshotCard";

const meta = {
  title: "Cards/ShareSnapshotCard",
  component: ShareSnapshotCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareSnapshotCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NetWorthGrowth: Story = {
  args: {
    milestone: {
      kind: "net_worth_growth",
      title: "Net Worth +34%",
      subtitle: "Grew from £32k to £43k this year",
      stat: "+34%",
      detail: null,
      accent: "emerald",
      achievedAt: "2026-04-01",
    },
    displayName: "Fahad",
  },
};

export const GoalCompleted: Story = {
  args: {
    milestone: {
      kind: "goal_completed",
      title: "Holiday Fund Complete",
      subtitle: "Saved the full £3,000 target",
      stat: "£3,000",
      detail: null,
      accent: "blue",
      achievedAt: "2026-03-15",
    },
    displayName: "Fahad",
  },
};

export const FunnyMilestone: Story = {
  args: {
    milestone: {
      kind: "funny",
      title: "Coffee Connoisseur",
      subtitle: "Your top micro-spend category",
      stat: "£142",
      detail: "That's roughly 47 flat whites this month.",
      accent: "rose",
      achievedAt: "2026-04-01",
      funnyPattern: "coffee_addict" as any,
    },
    displayName: "Fahad",
  },
};
