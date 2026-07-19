// PostToolUse hook: lints (and auto-fixes) the just-written file with Oxlint.
//
// @see https://docs.claude.com/en/docs/claude-code/hooks

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

// File extensions that Oxlint lints in this project
//
// @see .oxlintrc.json
const SUPPORTED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);

const input = JSON.parse(readFileSync(0, "utf8"));
const filePath = input.tool_input?.file_path;

if (
  typeof filePath === "string" &&
  SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase())
) {
  // Oxlint exits non-zero when lint problems remain after fixing; that is not
  // a hook failure (the edit still succeeds), so we only surface its stderr.
  spawnSync("pnpm", ["oxlint", "--fix", filePath], {
    stdio: ["ignore", "ignore", "inherit"],
  });

  console.log("{}");
}
