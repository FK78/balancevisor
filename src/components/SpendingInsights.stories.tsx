import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SpendingInsights } from "./SpendingInsights";

const meta = {
  title: "Data Display/SpendingInsights",
  component: SpendingInsights,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpendingInsights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {
  args: {
    insights: [
      { type: "spike", message: "Eating Out spending is 45% above your 3-month average." },
      { type: "drop", message: "Transport costs dropped 22% vs last month." },
      { type: "warning", message: "You've used 92% of your Groceries budget with 8 days remaining." },
      { type: "info", message: "Consider moving £200 to your Holiday Fund this month." },
      { type: "streak", message: "3-month spending streak in Shopping — up each month." },
    ],
  },
};

export const Empty: Story = {
  args: { insights: [] },
};
