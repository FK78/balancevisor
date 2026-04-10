import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareAchievementButton } from "./ShareAchievementButton";

const meta = {
  title: "Buttons/ShareAchievementButton",
  component: ShareAchievementButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ShareAchievementButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    milestone: {
      kind: "savings_streak",
      title: "6-Month Savings Streak",
      subtitle: "Positive savings for 6 consecutive months",
      stat: "6 months",
      detail: null,
      accent: "violet",
      achievedAt: "2026-04-10",
    },
    displayName: "Fahad",
  },
};
