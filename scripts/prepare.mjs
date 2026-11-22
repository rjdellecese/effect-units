// Runs on `pnpm install` (and when a consumer installs this repo as a git
// dependency, where the build produces the dist/ the exports map points at).

import { execSync } from "node:child_process";

// CI jobs run build/typecheck/lint explicitly; building during every job's
// install would be redundant and would misattribute compile errors to
// whichever job happened to be installing.
if (process.env.CI === undefined) {
  execSync("npm run build", { stdio: "inherit" });
}
