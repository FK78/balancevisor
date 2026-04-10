import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotificationBell } from "./NotificationBell";

const meta = {
  title: "Navigation/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoNotifications: Story = {
  args: {
    notifications: [],
    unreadCount: 0,
    reviewFlagCount: 0,
  },
};

export const WithUnread: Story = {
  args: {
    notifications: [
      {
        id: "n1",
        user_id: "u1",
        budget_id: "b1",
        alert_type: "threshold_warning",
        message: "Groceries budget is at 85%",
        is_read: false,
        emailed: false,
        created_at: new Date("2026-04-08"),
      },
      {
        id: "n2",
        user_id: "u1",
        budget_id: "b2",
        alert_type: "over_budget",
        message: "Transport budget exceeded by £12",
        is_read: false,
        emailed: true,
        created_at: new Date("2026-04-07"),
      },
      {
        id: "n3",
        user_id: "u1",
        budget_id: "b1",
        alert_type: "threshold_warning",
        message: "Groceries budget reached 70%",
        is_read: true,
        emailed: false,
        created_at: new Date("2026-04-05"),
      },
    ],
    unreadCount: 2,
    reviewFlagCount: 3,
  },
};
