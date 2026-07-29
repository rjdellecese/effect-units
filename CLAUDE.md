# Repo Overview

effect-units is a single-package TypeScript library providing typed quantities and unit conversions for Effect (requires Node >= 22, pnpm). It targets Effect v4, which is still in beta: `effect` is pinned exactly in devDependencies and declared as `^4.0.0-beta.102` in peerDependencies, and `@effect/vitest` is unified-versioned with it, so the two move together.

`pnpm-workspace.yaml` disables pnpm's strict dependency-build check. `effect@4` depends on `msgpackr`, whose optional native accelerator (`msgpackr-extract`) has a build script; the JS fallback is fully functional and this package never exercises msgpack, so the build is deliberately skipped rather than adding a native toolchain step to every install.

## Build System

The package is built with tsdown (JavaScript output; `dts: false` delegates declarations to tsc) plus TypeScript: `tsc -b tsconfig.src.json` emits the `.d.ts` declarations. `tsconfig.json` is the noEmit typecheck project covering all sources, tests, and root config files; both extend `tsconfig.base.json`. Relative imports use `.ts` extensions (`import * as Unit from "./Unit.ts"`, the Effect v4 convention): `rewriteRelativeImportExtensions` rewrites them to `.js` in tsdown's JavaScript output, declarations keep the `.ts` specifiers (which consumers' TypeScript resolves), and NodeNext module resolution makes tsc error on any extensionless relative import.

### Key Commands

- `pnpm build` - Build `dist/` (tsdown JavaScript + tsc declarations)
- `pnpm test` - Run the Vitest suite (includes type-level tests and coverage)
- `pnpm typecheck` - Typecheck sources and tests via `tsc -b`
- `pnpm lint`/`pnpm lint:fix` - Lint (Oxlint + Syncpack); `lint:fix` writes fixes
- `pnpm format`/`pnpm format:check` - Format (Oxfmt + Syncpack); `format` writes, `format:check` only checks
- `pnpm circular` - Fail on runtime import cycles (dpdm; type-only cycles are ignored)
- `pnpm clean` - Remove dist, coverage, and node_modules

## Conventions

- Import Effect modules from their submodule paths (e.g. `import * as Schema from "effect/Schema"`), not from bare `"effect"`—enforced for value imports by Oxlint's `no-restricted-imports` (type-only imports are exempt from the lint rule, but follow the convention anyway).
- Tests live in `test/*.test.ts` and use `@effect/vitest`; shared test helpers live alongside them in `test/` (excluded from the build and coverage).
- Source modules are PascalCase (one module per unit/quantity); helpers are camelCase.

## Versioning and Publishing

Versioning and changelogs are managed with Changesets. Use `pnpm changeset` to create a changeset before merging a PR with user-facing changes; the Release workflow opens/updates a "Version Packages" PR, and merging that PR publishes to npm, tags the release, and creates the GitHub release.

Publishing uses npm trusted publishing (OIDC): `.github/workflows/release.yml` requests an `id-token` and `pnpm publish` exchanges it for a short-lived registry token, so there is no npm token in the repo or in Actions secrets. npm's trusted publisher config for the package pins the workflow filename, so `release.yml` cannot be renamed without updating it at https://www.npmjs.com/package/effect-units/access. Provenance attestations are generated automatically as part of trusted publishing.

The published tarball is the `files` allowlist in `package.json` (`dist` plus `src`, so declaration maps resolve to sources) with `LICENSE`, `README.md`, and `package.json`. `dist` is gitignored but still ships, because `files` takes precedence. Verify a change to packaging with `CI=1 pnpm pack`.
