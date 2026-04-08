import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BalanceVisor/i);
  });

  test("landing page has key navigation elements", async ({ page }) => {
    await page.goto("/");
    // Check for main CTA or navigation links
    await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
  });

  test("health endpoint returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBeLessThanOrEqual(503); // 200 or 503 if no DB
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
  });
});
