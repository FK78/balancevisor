import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecurringDetectionBanner } from "./RecurringDetectionBanner";
import type { RecurringCandidate } from "@/lib/recurring-detection";

const meta = {
  title: "Banners/RecurringDetectionBanner",
  component: RecurringDetectionBanner,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecurringDetectionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeCandidate = (overrides: Partial<RecurringCandidate>): RecurringCandidate => ({
  description: "Spotify",
  amount: 10.99,
  type: "expense",
  occurrences: 4,
  avgDaysBetween: 30,
  suggestedPattern: "monthly",
  lastDate: "2026-04-01",
  latestTransactionId: "t1",
  ...overrides,
});

export const MultipleCandidates: Story = {
  args: {
    candidates: [
      makeCandidate({}),
      makeCandidate({ description: "Netflix", amount: 15.99, latestTransactionId: "t2" }),
      makeCandidate({ description: "Gym Membership", amount: 34.99, latestTransactionId: "t3" }),
    ],
    currency: "GBP",
  },
};

export const Single: Story = {
  args: {
    candidates: [makeCandidate({})],
    currency: "GBP",
  },
};
