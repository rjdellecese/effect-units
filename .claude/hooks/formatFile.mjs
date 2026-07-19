// PostToolUse hook: formats the just-written file with Oxfmt.
//
// @see https://docs.claude.com/en/docs/claude-code/hooks

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

// File extensions that Oxfmt supports
//
// @see https://oxc.rs/docs/guide/usage/formatter
const SUPPORTED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".json",
  ".jsonc",
  ".json5",
  ".yaml",
  ".yml",
  ".toml",
  ".html",
  ".htm",
  ".vue",
  ".css",
  ".scss",
  ".less",
  ".md",
  ".mdx",
  ".graphql",
  ".gql",
  ".hbs",
]);

const input = JSON.parse(readFileSync(0, "utf8"));
const filePath = input.tool_input?.file_path;

if (
  typeof filePath === "string" &&
  SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase())
) {
  const { status } = spawnSync("pnpm", ["oxfmt", filePath], {
    stdio: ["ignore", "ignore", "inherit"],
  });

  if (status === 0) {
    console.log("{}");
  }
}
