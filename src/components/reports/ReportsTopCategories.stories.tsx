import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsTopCategories } from "./ReportsTopCategories";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/TopCategories",
  component: ReportsTopCategories,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsTopCategories>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
