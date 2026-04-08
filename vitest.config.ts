import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules",
      ".next",
      "e2e",
      "src/lib/encryption.test.ts",
      "src/lib/transaction-intelligence.test.ts",
    ],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "html"],
      include: ["src/lib/**/*.ts", "src/db/**/*.ts", "src/app/api/**/*.ts"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/lib/supabase/**",
        "src/db/migrations/**",
        "src/db/seed.ts",
      ],
      thresholds: {
        // Baseline thresholds — ratchet up as coverage grows
        lines: 12,
        branches: 11,
        functions: 13,
        statements: 12,
      },
    },
    // Component tests use `// @vitest-environment happy-dom` comment directive
  },
});
