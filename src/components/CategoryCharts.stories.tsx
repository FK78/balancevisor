import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryCharts } from "./CategoryCharts";

const meta = {
  title: "Charts/CategoryCharts",
  component: CategoryCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATEGORIES = [
  { name: "Groceries", color: "#34C759" },
  { name: "Transport", color: "#007AFF" },
  { name: "Eating Out", color: "#FF9500" },
  { name: "Entertainment", color: "#AF52DE" },
  { name: "Shopping", color: "#FF2D55" },
];

const topThisMonth = CATEGORIES.map((c, i) => ({
  category: c.name,
  color: c.color,
  total: [450, 120, 180, 75, 210][i],
}));

const monthlyRows = ["2026-01", "2026-02", "2026-03"].flatMap((month) =>
  CATEGORIES.map((c, i) => ({
    month,
    category: c.name,
    category_id: `cat-${i}`,
    color: c.color,
    total: Math.round(100 + Math.random() * 200),
  })),
);

export const Default: Story = {
  args: {
    topThisMonth,
    monthlyRows,
    currency: "GBP",
  },
};
