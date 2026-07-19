import { defineConfig } from "tsdown";

// tsdown emits the JavaScript only; `tsc -b tsconfig.src.json` emits the
// declarations (see the `build` script).
export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.ts", "!src/internal/testUtils.ts"],
  platform: "neutral",
  outDir: "dist",
  clean: true,
  dts: false,
  sourcemap: true,
  format: ["esm"],
  unbundle: true,
});
