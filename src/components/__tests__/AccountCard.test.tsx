// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AccountCard } from "@/components/AccountCard";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AccountCard", () => {
  it("renders a linkable decision card with status, interpretation, and portfolio share", () => {
    render(
      <AccountCard
        account={{
          id: "acc_1",
          accountName: "Rewards Card",
          type: "creditCard",
          balance: -240,
          transactions: 16,
          isShared: false,
        }}
        currency="GBP"
        totalAbsoluteBalance={1200}
        shareCount={1}
      />,
    );

    expect(screen.getByRole("link", { name: /rewards card/i })).toHaveAttribute(
      "href",
      "/dashboard/accounts/acc_1",
    );
    expect(screen.getByText("Liability watch")).toBeInTheDocument();
    expect(screen.getByText("Shared with 1 person")).toBeInTheDocument();
    expect(screen.getByText("20.0% of total exposure")).toBeInTheDocument();
    expect(screen.getByText(/prioritise paydown/i)).toBeInTheDocument();
    expect(screen.getByText("−£240.00")).toBeInTheDocument();
    expect(screen.getByText(/open account cockpit/i)).toBeInTheDocument();
  });
});
