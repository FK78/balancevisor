import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardHealthScore } from "./DashboardHealthScore";
import type { HealthScoreResult } from "@/lib/financial-health-score";

const meta = {
  title: "Dashboard/HealthScore",
  component: DashboardHealthScore,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardHealthScore>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE_SUB_SCORES: HealthScoreResult["subScores"] = [
  { label: "Savings Rate", score: 18, maxScore: 20, description: "Excellent savings habit" },
  { label: "Net Worth Trend", score: 16, maxScore: 20, description: "Consistent growth" },
  { label: "Debt-to-Asset", score: 20, maxScore: 20, description: "Very low leverage" },
  { label: "Budget Adherence", score: 17, maxScore: 20, description: "Mostly on track" },
  { label: "Emergency Fund", score: 15, maxScore: 20, description: "4 months covered" },
];

export const GradeA: Story = {
  name: "Grade A — Excellent",
  args: {
    healthScore: {
      overall: 86,
      grade: "A",
      subScores: BASE_SUB_SCORES,
    },
  },
};

export const GradeB: Story = {
  name: "Grade B — Good",
  args: {
    healthScore: {
      overall: 72,
      grade: "B",
      subScores: [
        { label: "Savings Rate", score: 14, maxScore: 20, description: "Good savings habit" },
        { label: "Net Worth Trend", score: 15, maxScore: 20, description: "Steady growth" },
        { label: "Debt-to-Asset", score: 18, maxScore: 20, description: "Low leverage" },
        { label: "Budget Adherence", score: 12, maxScore: 20, description: "Some overspend" },
        { label: "Emergency Fund", score: 13, maxScore: 20, description: "3 months covered" },
      ],
    },
  },
};

export const GradeC: Story = {
  name: "Grade C — Fair",
  args: {
    healthScore: {
      overall: 55,
      grade: "C",
      subScores: [
        { label: "Savings Rate", score: 10, maxScore: 20, description: "Below target" },
        { label: "Net Worth Trend", score: 12, maxScore: 20, description: "Flat trend" },
        { label: "Debt-to-Asset", score: 14, maxScore: 20, description: "Moderate leverage" },
        { label: "Budget Adherence", score: 10, maxScore: 20, description: "Frequent overspend" },
        { label: "Emergency Fund", score: 9, maxScore: 20, description: "2 months covered" },
      ],
    },
  },
};

export const GradeF: Story = {
  name: "Grade F — Critical",
  args: {
    healthScore: {
      overall: 22,
      grade: "F",
      subScores: [
        { label: "Savings Rate", score: 2, maxScore: 20, description: "Negative savings" },
        { label: "Net Worth Trend", score: 5, maxScore: 20, description: "Declining" },
        { label: "Debt-to-Asset", score: 6, maxScore: 20, description: "High leverage" },
        { label: "Budget Adherence", score: 4, maxScore: 20, description: "Consistently over" },
        { label: "Emergency Fund", score: 5, maxScore: 20, description: "Less than 1 month" },
      ],
    },
  },
};
