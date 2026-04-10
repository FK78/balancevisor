import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GoalForecastCard } from "./GoalForecastCard";
import type { GoalForecast } from "@/lib/goal-forecast";

const meta = {
  title: "Cards/GoalForecastCard",
  component: GoalForecastCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoalForecastCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeForecast = (overrides: Partial<GoalForecast>): GoalForecast => ({
  goalId: "g1",
  goalName: "Holiday Fund",
  goalColor: "#007AFF",
  targetAmount: 3000,
  savedAmount: 1200,
  remaining: 1800,
  targetDate: "2026-12-01",
  avgMonthlySavings: 280,
  estimatedMonths: 7,
  estimatedDate: "2026-11-01",
  requiredMonthlySavings: 225,
  monthsUntilDeadline: 8,
  status: "on_track",
  ...overrides,
});

export const MixedStatuses: Story = {
  args: {
    currency: "GBP",
    forecasts: [
      makeForecast({}),
      makeForecast({
        goalId: "g2",
        goalName: "Emergency Fund",
        goalColor: "#FF9500",
        targetAmount: 5000,
        savedAmount: 800,
        remaining: 4200,
        status: "behind",
        estimatedMonths: 15,
        monthsUntilDeadline: 6,
      }),
      makeForecast({
        goalId: "g3",
        goalName: "New Laptop",
        goalColor: "#AF52DE",
        targetAmount: 1500,
        savedAmount: 1500,
        remaining: 0,
        status: "completed",
      }),
    ],
  },
};

export const AllOnTrack: Story = {
  args: {
    currency: "GBP",
    forecasts: [
      makeForecast({}),
      makeForecast({
        goalId: "g2",
        goalName: "Car Deposit",
        goalColor: "#34C759",
        targetAmount: 8000,
        savedAmount: 5500,
        remaining: 2500,
        status: "on_track",
      }),
    ],
  },
};
