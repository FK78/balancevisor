import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsRangeFilter } from "./ReportsRangeFilter";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/RangeFilter",
  component: ReportsRangeFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsRangeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
