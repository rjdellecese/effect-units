# Repo Overview

effect-units is a single-package TypeScript library providing typed quantities and unit conversions for Effect (requires Node >= 22, pnpm).

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

Versioning and changelogs are managed with Changesets. Use `pnpm changeset` to create a changeset before merging a PR with user-facing changes; the Release workflow opens/updates a "Version Packages" PR and tags releases when it merges. The package is currently `private`, so `changeset publish` tags releases without publishing to npm.
