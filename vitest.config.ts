import { defineConfig } from "vitest/config";

// Coverage and test-file typechecking are opted into by the `test` script
// (`vitest run --coverage --typecheck`) so watch mode stays fast.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: {
      include: ["test/**/*.test.ts"],
    },
    coverage: {
      exclude: ["test/**/*"],
    },
  },
});
