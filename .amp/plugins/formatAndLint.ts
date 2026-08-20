import type {
  PluginAPI,
  ToolResultEvent,
  ToolResultResult,
} from "@ampcode/plugin";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";

export const description =
  "Automatically formats files changed by Amp with Oxfmt, then fixes and reports Oxlint diagnostics.";

const FORMAT_EXTENSIONS = new Set([
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

const LINT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);

const appendDiagnostics = (
  event: ToolResultEvent,
  diagnostics: string[],
): ToolResultResult => {
  const message = diagnostics.join("\n\n");
  const output =
    typeof event.output === "string"
      ? `${event.output}\n\n${message}`
      : event.output === undefined
        ? message
        : `${JSON.stringify(event.output)}\n\n${message}`;

  return event.error === undefined
    ? { status: event.status, output }
    : { status: event.status, error: event.error, output };
};

export default function (amp: PluginAPI) {
  const workspaceRoot = amp.system.workspaceRoot;
  if (workspaceRoot === null) {
    return;
  }

  const projectDir = amp.helpers.filePathFromURI(workspaceRoot);
  const formatter = join(projectDir, "node_modules/oxfmt/bin/oxfmt");
  const linter = join(projectDir, "node_modules/oxlint/bin/oxlint");

  amp.on("tool.result", (event) => {
    if (event.status !== "done") {
      return;
    }

    const modifiedFiles = amp.helpers.filesModifiedByToolCall(event);
    if (modifiedFiles === null) {
      return;
    }

    const diagnostics: string[] = [];
    for (const filePath of new Set(
      modifiedFiles.map(amp.helpers.filePathFromURI),
    )) {
      if (!existsSync(filePath)) {
        continue;
      }

      const extension = extname(filePath).toLowerCase();
      if (FORMAT_EXTENSIONS.has(extension)) {
        const result = spawnSync("bun", [formatter, filePath], {
          cwd: projectDir,
          encoding: "utf8",
        });
        if (result.error !== undefined || result.status !== 0) {
          diagnostics.push(
            `Oxfmt failed on ${filePath}:\n${result.error?.message ?? ""}${result.stdout}${result.stderr}`,
          );
          continue;
        }
      }

      if (LINT_EXTENSIONS.has(extension)) {
        const result = spawnSync("bun", [linter, "--fix", filePath], {
          cwd: projectDir,
          encoding: "utf8",
        });
        if (result.error !== undefined || result.status !== 0) {
          diagnostics.push(
            `Oxlint found problems in ${filePath} that --fix could not fix:\n${result.error?.message ?? ""}${result.stdout}${result.stderr}`,
          );
        }
      }
    }

    return diagnostics.length === 0
      ? undefined
      : appendDiagnostics(event, diagnostics);
  });
}
