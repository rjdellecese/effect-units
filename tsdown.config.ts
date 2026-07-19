import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.ts"],
  platform: "neutral",
  outDir: "dist",
  clean: true,
  dts: false,
  sourcemap: true,
  format: ["esm"],
  unbundle: true,
});
