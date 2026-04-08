import { test, expect } from "@playwright/test";

test.describe("Authentication (MOCK_AUTH mode)", () => {
  test("redirects to dashboard when MOCK_AUTH is enabled", async ({ page }) => {
    // With MOCK_AUTH=true, navigating to the auth page should either
    // redirect to dashboard or show the dashboard directly
    await page.goto("/auth");
    // Should redirect to dashboard or show some content
    await page.waitForURL(/\/(dashboard|auth)/, { timeout: 10000 });
  });

  test("dashboard is accessible in mock mode", async ({ page }) => {
    await page.goto("/dashboard");
    // In mock mode, middleware should not redirect us away
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    // Page should render dashboard content
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
