# Repo Overview

effect-units is a single-package TypeScript library providing typed quantities and unit conversions for Effect (requires Node >= 22, pnpm). It targets Effect v4, which is still in beta: `effect` is pinned exactly in devDependencies and declared as `^4.0.0-beta.102` in peerDependencies, and `@effect/vitest` is unified-versioned with it, so the two move together.

`pnpm-workspace.yaml` exists only to answer pnpm 11's build-script prompt: `effect@4` depends on `msgpackr`, whose optional native accelerator (`msgpackr-extract`) has a build script. `allowBuilds: { msgpackr-extract: false }` declines it—the JS fallback is fully functional and this package never exercises msgpack, so the build is deliberately skipped rather than adding a native toolchain step to every install. Note `allowBuilds` is the current mechanism; the older `onlyBuiltDependencies`/`ignoredBuiltDependencies` keys do not satisfy pnpm 11's check, and pnpm rewrites the file with an `allowBuilds` placeholder until it is set.

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
- Import Effect modules unaliased even when the name shadows a global (`import * as String from "effect/String"`), and reach for the built-in through `globalThis` (`globalThis.String(n)`, `globalThis.BigInt(n)`). Alias only to avoid shadowing a local export—`order` for `effect/Order` next to an exported `Order`, `Equivalence_` next to an exported `Equivalence`.
- Schemas follow the Effect v4 convention: the bare name is the identity schema and `XFromY` is the codec, named for its encoded form (`Unit`/`UnitFromString`, `Length`/`LengthFromStruct`). There is no `FromSelf`—that was the v3 spelling, and v4 dropped it.
- Every declaration carries its wire format twice over: once as the named `XFromY` codec (precise encoded type) and once as a `toCodecJson` annotation (composable, so `Schema.toCodecJson` works when the value is nested in a caller's schema, and nested declarations lower automatically). Both are built from a single `wire`/`wireStruct` + `wireTransformation` definition per module so they cannot drift. A declaration _without_ the annotation falls back to `Json` and fails at runtime on any non-JSON value; each of those six modules' own test file carries the regression test, in its `toCodecJson` block.
- Functions returning `boolean` are prefixed `is`/`are`, with two deliberate exceptions that keep this package aligned with Effect v4's own modules: `equals`/`equalsWithin` (v4 exports `equals` unprefixed from `BigDecimal`, `Duration`, `Cron`, and `Equal`), and `Equivalence`, which is a typeclass instance like `Order` rather than a predicate. Note `Rational.isBetween` deliberately _does_ take the prefix even though v4 spells it `BigDecimal.between`; v4 is inconsistent there (only `Order.isBetween` is prefixed) and this package is not. `Duration.between`/`DurationExact.between` are unrelated—they return a duration, not a boolean.

## Versioning and Publishing

Versioning and changelogs are managed with Changesets. Use `pnpm changeset` to create a changeset before merging a PR with user-facing changes; the Release workflow opens/updates a "Version Packages" PR, and merging that PR publishes to npm, tags the release, and creates the GitHub release.

Publishing uses npm trusted publishing (OIDC): `.github/workflows/release.yml` requests an `id-token` and `pnpm publish` exchanges it for a short-lived registry token, so there is no npm token in the repo or in Actions secrets. npm's trusted publisher config for the package pins the workflow filename, so `release.yml` cannot be renamed without updating it at https://www.npmjs.com/package/effect-units/access. Provenance attestations are generated automatically as part of trusted publishing.

The published tarball is the `files` allowlist in `package.json` (`dist` plus `src`, so declaration maps resolve to sources) with `LICENSE`, `README.md`, and `package.json`. `dist` is gitignored but still ships, because `files` takes precedence. Verify a change to packaging with `CI=1 pnpm pack`.
