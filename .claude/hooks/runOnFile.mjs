// Shared scaffolding for the PostToolUse hooks: parse the hook input from
// stdin, gate on file extension, and run a Node-based tool from
// node_modules on the edited file.
//
// @see https://docs.claude.com/en/docs/claude-code/hooks

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

export const projectDir =
  process.env.CLAUDE_PROJECT_DIR ?? join(import.meta.dirname, "..", "..");

// The tools' bin entries are Node scripts, so running them with the current
// Node executable avoids a package-manager launcher (slow, and pnpm/.cmd
// shims are not portably spawnable) while staying cross-platform.
export const runOnFile = ({ extensions, binPath, args = [] }) => {
  let filePath;
  try {
    filePath = JSON.parse(readFileSync(0, "utf8")).tool_input?.file_path;
  } catch {
    return null;
  }

  if (
    typeof filePath !== "string" ||
    !extensions.has(extname(filePath).toLowerCase())
  ) {
    return null;
  }

  const bin = join(projectDir, binPath);

  if (!existsSync(bin)) {
    console.error(`${bin} not found; run pnpm install`);
    process.exit(1);
  }

  const result = spawnSync(process.execPath, [bin, ...args, filePath], {
    cwd: projectDir,
    encoding: "utf8",
  });

  if (result.error !== undefined || result.status === null) {
    console.error(
      `Failed to run ${binPath} on ${filePath}: ${
        result.error?.message ?? "no exit status"
      }`,
    );
    process.exit(1);
  }

  return { filePath, ...result };
};
