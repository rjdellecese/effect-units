// PostToolUse hook: lints (and auto-fixes) the just-written file with Oxlint.

import { runOnFile } from "./runOnFile.mjs";

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

const result = runOnFile({
  extensions: SUPPORTED_EXTENSIONS,
  binPath: "node_modules/oxlint/bin/oxlint",
  args: ["--fix"],
});

if (result === null || result.status === 0) {
  console.log("{}");
} else {
  // Oxlint exits non-zero when problems remain after fixing and prints its
  // diagnostics to stdout. That is not a hook failure (the edit still
  // succeeds), but a plain-exit hook's output never reaches the model, so
  // relay the diagnostics as additional context.
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Oxlint found problems in ${result.filePath} that --fix could not fix:\n${result.stdout}${result.stderr}`,
      },
    }),
  );
}
