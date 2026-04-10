import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ZakatSettingsDialog } from "./ZakatSettingsDialog";

const meta = {
  title: "Dialogs/ZakatSettingsDialog",
  component: ZakatSettingsDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ZakatSettingsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSettings: Story = {
  args: { settings: null, baseCurrency: "GBP" },
};

export const WithSettings: Story = {
  args: {
    settings: {
      anniversary_date: "2026-01-15",
      nisab_type: "gold",
      use_lunar_calendar: false,
    },
    baseCurrency: "GBP",
  },
};
