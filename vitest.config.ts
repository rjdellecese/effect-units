import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    typecheck: {
      enabled: true,
      include: ["src/**/*.test.ts"],
    },
    coverage: {
      enabled: true,
      exclude: [
        "tsdown.config.ts",
        "vitest.config.ts",
        "coverage/**/*",
        "dist/**/*",
        "src/**/*.test.ts",
        "src/internal/testUtils.ts",
      ],
    },
  },
});
