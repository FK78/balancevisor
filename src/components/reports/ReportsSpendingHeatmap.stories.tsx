import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsSpendingHeatmap } from "./ReportsSpendingHeatmap";

const meta = {
  title: "Reports/SpendingHeatmap",
  component: ReportsSpendingHeatmap,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportsSpendingHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateDailyTrend = () => {
  const days = [];
  const start = new Date();
  start.setDate(start.getDate() - 90);

  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const day = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({
      day,
      income: i % 30 === 0 ? 3200 : 0,
      expenses: Math.round((isWeekend ? 80 : 40) + Math.random() * 60),
      refunds: 0,
      net: 0,
    });
  }
  return days;
};

export const Default: Story = {
  args: {
    dailyTrend: generateDailyTrend(),
    currency: "GBP",
  },
};
