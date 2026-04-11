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

export const AccountsStage: Story = {
  args: {
    currentStage: "accounts",
    stageTitle: "Add your accounts",
    stageDescription: "Connect your bank or add accounts manually so your dashboard has real data.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Accounts content placeholder
      </div>
    ),
  },
};

export const CategoriesStage: Story = {
  args: {
    currentStage: "categories",
    stageTitle: "Set up your categories",
    stageDescription: "Give your spending a structure so transactions are organised from day one.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Categories content placeholder
      </div>
    ),
  },
};

export const FeaturesStage: Story = {
  args: {
    currentStage: "features",
    stageTitle: "Pick your focus areas",
    stageDescription: "Choose the areas you care about most to shape your first dashboard experience.",
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Features content placeholder
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
