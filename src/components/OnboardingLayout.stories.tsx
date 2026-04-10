import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OnboardingLayout } from "./OnboardingLayout";

const meta = {
  title: "Onboarding/OnboardingLayout",
  component: OnboardingLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicsStage: Story = {
  args: {
    currentStage: "basics",
    stageTitle: "Set up your basics",
    stageDescription: "Choose your base currency and decide whether AI features should be enabled.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Step content placeholder
      </div>
    ),
  },
};

export const SetupStage: Story = {
  args: {
    currentStage: "setup",
    stageTitle: "Finish your money setup",
    stageDescription: "Add the essentials that make your dashboard useful from day one.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Setup content placeholder
      </div>
    ),
  },
};

export const ReviewStage: Story = {
  args: {
    currentStage: "review",
    stageTitle: "Review and go",
    stageDescription: "Review your setup and launch into your dashboard.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Review content placeholder
      </div>
    ),
  },
};
