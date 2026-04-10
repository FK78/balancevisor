import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "html"],
      include: ["src/lib/**/*.ts", "src/db/**/*.ts", "src/app/api/**/*.ts"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/__tests__/**", "src/lib/supabase/**", "src/db/migrations/**", "src/db/seed.ts"],
      thresholds: {
        // Baseline thresholds — ratchet up as coverage grows
        lines: 12,
        branches: 11,
        functions: 13,
        statements: 12
      }
    }
    // Component tests use `// @vitest-environment happy-dom` comment directive
    ,
    projects: [{
      extends: true,
      test: {
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        exclude: ["node_modules", ".next", "e2e", "src/lib/encryption.test.ts", "src/lib/transaction-intelligence.test.ts"],
        environment: "node"
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});