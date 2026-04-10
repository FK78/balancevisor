import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardGoalsSummary } from "./DashboardGoalsSummary";

const meta = {
  title: "Dashboard/GoalsSummary",
  component: DashboardGoalsSummary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardGoalsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    goals: [
      { id: "g1", name: "Holiday Fund", target_amount: 3000, saved_amount: 1800, color: "#007AFF" },
      { id: "g2", name: "Emergency Fund", target_amount: 10000, saved_amount: 7500, color: "#34C759" },
      { id: "g3", name: "New Laptop", target_amount: 1500, saved_amount: 400, color: "#AF52DE" },
    ],
    currency: "GBP",
  },
};

export const OneComplete: Story = {
  args: {
    goals: [
      { id: "g1", name: "Holiday Fund", target_amount: 3000, saved_amount: 3000, color: "#007AFF" },
      { id: "g2", name: "Emergency Fund", target_amount: 10000, saved_amount: 4200, color: "#34C759" },
    ],
    currency: "GBP",
  },
};

export const AllComplete: Story = {
  args: {
    goals: [
      { id: "g1", name: "Holiday Fund", target_amount: 3000, saved_amount: 3500, color: "#007AFF" },
      { id: "g2", name: "New Laptop", target_amount: 1500, saved_amount: 1500, color: "#AF52DE" },
    ],
    currency: "GBP",
  },
};
