import { defineConfig, devices } from "@playwright/test";
import { MOCK_AUTH_HEADER } from "./src/lib/mock-auth";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    extraHTTPHeaders: {
      [MOCK_AUTH_HEADER]: "true",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command:
      `PORT=${port} MOCK_AUTH=true NEXT_PUBLIC_MOCK_AUTH=true NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
