import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import * as Public from "./public.mts";

const packageRoot = dirname(
  fileURLToPath(import.meta.resolve("effect-units/package.json")),
);

test("loads and typechecks every public module in the installed package", () => {
  const modules = readdirSync(join(packageRoot, "dist"))
    .filter((name) => name.endsWith(".js"))
    .map((name) => name.slice(0, -3));

  assert.deepEqual(Object.keys(Public).sort(), modules.sort());
});

test("rejects private imports at runtime and in both TypeScript resolution modes", async () => {
  await assert.rejects(
    // @ts-expect-error Internal modules are not public.
    () => import("effect-units/internal"),
    { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" },
  );
  await assert.rejects(
    // @ts-expect-error Private subpaths are not exported.
    () => import("effect-units/internal/valueObject"),
    { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" },
  );
  await assert.rejects(
    // @ts-expect-error Adding a file extension does not expose a private subpath.
    () => import("effect-units/internal/valueObject.js"),
    { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" },
  );

  const modules = readdirSync(join(packageRoot, "dist", "internal"), {
    encoding: "utf8",
    recursive: true,
  })
    .filter((name) => name.endsWith(".js"))
    .map((name) => name.replaceAll("\\", "/"));
  assert.ok(modules.length > 0);

  const paths = modules.flatMap((name) => [
    `effect-units/internal/${name.slice(0, -3)}`,
    `effect-units/internal/${name}`,
  ]);
  await Promise.all(
    paths.map(async (specifier) => {
      await assert.rejects(
        () => import(specifier),
        { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" },
        specifier,
      );
    }),
  );
});
