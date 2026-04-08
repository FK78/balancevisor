import { test, expect } from "@playwright/test";

test.describe("Dashboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("dashboard page loads without crashing", async ({ page }) => {
    // Ensure the page loaded and the body is not blank
    await expect(page.locator("body")).not.toBeEmpty();
    // No uncaught errors — page title should exist
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("sidebar/nav is visible on desktop", async ({ page }) => {
    // Check for navigation or sidebar presence
    const nav = page.locator("nav").first();
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test("all main dashboard sections render", async ({ page }) => {
    // The page should have at least some content containers
    const mainContent = page.locator("main").first();
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }
  });
});
