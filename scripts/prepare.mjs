// Runs on `pnpm install` (and when a consumer installs this repo as a git
// dependency, where the build produces the dist/ the exports map points at).

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

// CI jobs run build/typecheck/lint explicitly; building during every job's
// install would be redundant and would misattribute compile errors to
// whichever job happened to be installing.
if (process.env.CI !== undefined) {
  process.exit(0);
}

const projectDir = join(import.meta.dirname, "..");

const run = (args, { optional = false } = {}) => {
  const { error, status } = spawnSync(process.execPath, args, {
    cwd: projectDir,
    stdio: "inherit",
  });

  if (error !== undefined || status !== 0) {
    const message = error?.message ?? `exit code ${String(status)}`;

    if (optional) {
      console.warn(`prepare: ${args.join(" ")} failed (${message}); skipping`);
    } else {
      process.exit(status ?? 1);
    }
  }
};

// Patching TypeScript enables @effect/language-service diagnostics in tsc and
// tsserver. It is dev-environment sugar: never fail an install over it.
const languageService = join(
  projectDir,
  "node_modules",
  "@effect",
  "language-service",
  "cli.js",
);

if (existsSync(languageService)) {
  run([languageService, "patch"], { optional: true });
}

run([join(projectDir, "node_modules", "tsdown", "dist", "run.mjs")]);
run([
  join(projectDir, "node_modules", "typescript", "bin", "tsc"),
  "-b",
  "tsconfig.src.json",
]);
