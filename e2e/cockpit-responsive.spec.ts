import { test, expect, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile-375", size: { width: 375, height: 812 } },
  { name: "mobile-390", size: { width: 390, height: 844 } },
  { name: "tablet-768", size: { width: 768, height: 1024 } },
  { name: "laptop-1024", size: { width: 1024, height: 900 } },
  { name: "desktop-1440", size: { width: 1440, height: 1080 } },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

async function expectResponsiveRoute(
  page: Page,
  route: string,
  assertion: (page: Page) => Promise<void>,
) {
  for (const viewport of viewports) {
    await test.step(`${route} @ ${viewport.name}`, async () => {
      await page.setViewportSize(viewport.size);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await assertion(page);
      await expectNoHorizontalOverflow(page);
    });
  }
}

test.describe("Balanced cockpit responsive QA", () => {
  test("landing page keeps the new public story readable", async ({ page }) => {
    await expectResponsiveRoute(page, "/", async (currentPage) => {
      await expect(
        currentPage.getByRole("heading", { name: /see what matters\./i }),
      ).toBeVisible();
      await expect(
        currentPage.getByRole("link", { name: /get started/i }).first(),
      ).toBeVisible();
    });
  });

  test("login page keeps the softer auth shell intact", async ({ page }) => {
    await expectResponsiveRoute(page, "/auth/login", async (currentPage) => {
      await expect(
        currentPage.getByText(/sign in to your balancevisor account to continue/i),
      ).toBeVisible();
      await expect(
        currentPage.getByRole("button", { name: /^sign in$/i }),
      ).toBeVisible();
    });
  });

  test("dashboard keeps cockpit navigation and next-step guidance visible", async ({ page }) => {
    await expectResponsiveRoute(page, "/dashboard", async (currentPage) => {
      await expect(
        currentPage.getByRole("heading", { name: /stay on top of the few things worth checking/i }),
      ).toBeVisible();
      await expect(
        currentPage.getByRole("tablist", { name: /dashboard sections/i }),
      ).toBeVisible();
    });
  });

  test("transactions keeps workspace tabs and action shelf visible", async ({ page }) => {
    await expectResponsiveRoute(page, "/dashboard/transactions", async (currentPage) => {
      await expect(
        currentPage.getByRole("heading", { name: /keep the action shelf nearby/i }),
      ).toBeVisible();
      await expect(
        currentPage.getByRole("tablist", { name: /transactions workspace tabs/i }),
      ).toBeVisible();
    });
  });

  test("accounts keeps summary shelf and workspace tabs visible", async ({ page }) => {
    await expectResponsiveRoute(page, "/dashboard/accounts", async (currentPage) => {
      await expect(
        currentPage.getByRole("heading", { name: /start with the balance picture/i }),
      ).toBeVisible();
      await expect(
        currentPage.getByRole("tablist", { name: /accounts workspace tabs/i }),
      ).toBeVisible();
    });
  });
});
