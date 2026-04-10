import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InterestPicker } from "./InterestPicker";

const meta = {
  title: "Onboarding/InterestPicker",
  component: InterestPicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InterestPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoneSelected: Story = {
  args: {},
};

export const SomeSelected: Story = {
  args: {
    defaultSelected: ["budgets", "goals"],
  },
};

export const AllSelected: Story = {
  args: {
    defaultSelected: ["budgets", "goals", "debts", "subscriptions", "investments"],
  },
};
