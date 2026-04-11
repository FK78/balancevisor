import { test, expect } from "@playwright/test";

test.describe("Authentication (MOCK_AUTH mode)", () => {
  test("auth pages stay reachable for visual QA when MOCK_AUTH is enabled", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByText(/sign in to your balancevisor account to continue/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^sign in$/i }),
    ).toBeVisible();
  });

  test("dashboard is accessible in mock mode", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /stay on top of the few things worth checking/i }),
    ).toBeVisible();
  });
});
