// PostToolUse hook: formats the just-written file with Oxfmt.

import { runOnFile } from "./runOnFile.mjs";

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

const result = runOnFile({
  extensions: SUPPORTED_EXTENSIONS,
  binPath: "node_modules/oxfmt/bin/oxfmt",
});

if (result === null || result.status === 0) {
  console.log("{}");
} else {
  console.error(
    `Oxfmt failed on ${result.filePath}:\n${result.stdout}${result.stderr}`,
  );
  process.exit(1);
}
