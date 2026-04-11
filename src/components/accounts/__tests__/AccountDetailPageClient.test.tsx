// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountDetailPageClient } from "@/components/accounts/AccountDetailPageClient";

describe("AccountDetailPageClient", () => {
  it("shows the account cockpit before the embedded activity workspace", () => {
    render(
      <AccountDetailPageClient
        breadcrumbHref="/dashboard/accounts"
        accountName="Monzo Current"
        heroAside={<div>Current account</div>}
        actionShelf={<div>Action shelf</div>}
        priorityCards={<div>Priority cards</div>}
        activity={<div>Embedded activity workspace</div>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /keep this account in clear view/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Action shelf")).toBeInTheDocument();
    expect(screen.getByText("Embedded activity workspace")).toBeInTheDocument();
  });
});
