# Repo Overview

effect-units is a single-package TypeScript library providing typed quantities and unit conversions for Effect (requires Node >= 22, pnpm).

## Build System

The package is built with tsdown (JavaScript output; `dts: false` delegates declarations to tsc) plus TypeScript: `tsc -b tsconfig.src.json` emits the `.d.ts` declarations. `tsconfig.json` is the noEmit typecheck project covering all sources, tests, and root config files; both extend `tsconfig.base.json`. Relative imports use TS-ESM `.js` extensions (`import * as Unit from "./Unit.js"`) so the emitted declarations resolve under Node16/NodeNext module resolution.

### Key Commands

- `pnpm build` - Build `dist/` (tsdown JavaScript + tsc declarations)
- `pnpm test` - Run the Vitest suite (includes type-level tests and coverage)
- `pnpm typecheck` - Typecheck sources and tests via `tsc -b`
- `pnpm lint` / `pnpm lint:fix` - Lint (Oxlint + Syncpack); `lint:fix` writes fixes
- `pnpm format` / `pnpm format:check` - Format (Oxfmt + Syncpack); `format` writes, `format:check` only checks
- `pnpm circular` - Fail on runtime import cycles (dpdm; type-only cycles are ignored)
- `pnpm clean` - Remove dist, coverage, and node_modules

## Conventions

- Import Effect modules from their submodule paths (e.g. `import * as Schema from "effect/Schema"`), not from bare `"effect"` — enforced for value imports by Oxlint's `no-restricted-imports` (type-only imports are exempt from the lint rule, but follow the convention anyway).
- Tests are colocated with sources as `src/*.test.ts` and use `@effect/vitest`; shared test helpers live in `test/` (excluded from the build and coverage).
- Source modules are PascalCase (one module per unit/quantity); helpers are camelCase.

## Versioning and Publishing

Versioning and changelogs are managed with Changesets. Use `pnpm changeset` to create a changeset before merging a PR with user-facing changes; the Release workflow opens/updates a "Version Packages" PR and tags releases when it merges. The package is currently `private`, so `changeset publish` tags releases without publishing to npm.
