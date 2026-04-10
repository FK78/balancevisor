import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeaturesStep } from "./FeaturesStep";

const meta = {
  title: "Onboarding/FeaturesStep",
  component: FeaturesStep,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeaturesStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoneSelected: Story = {
  args: {
    aiEnabled: true,
    selectedFeatures: [],
    onChange: () => {},
  },
};

export const SomeSelected: Story = {
  args: {
    aiEnabled: true,
    selectedFeatures: ["transactions", "budgets", "goals"],
    onChange: () => {},
  },
};

export const AiDisabled: Story = {
  args: {
    aiEnabled: false,
    selectedFeatures: ["transactions"],
    onChange: () => {},
  },
};
