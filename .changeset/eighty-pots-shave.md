---
"effect-units": minor
---

Require Effect v4.

`effect` is now a `^4.0.0-beta.102` peer dependency. Effect v4 is still in beta, so consumers need `effect@beta` (or a pinned `4.0.0-beta.*`).

The wire format is unchanged — quantities still encode as `{ unit, value }`, with exact values in the canonical rational encoding — so persisted data survives the upgrade. Two user-visible changes:

- `toString()` on quantities, temperatures, and rationals now emits compact JSON rather than 2-space-indented JSON, following Effect v4's formatter default. `toJSON()` is unchanged.
- Schema decoding and encoding now fail with Effect v4's `SchemaError` instead of `ParseResult.ParseError`, and the `Either`-returning entry points are now the `Result`-returning ones (`Schema.decodeUnknownResult`, `Schema.encodeResult`, …).

Alongside it, this package's own `unsafe*` functions move to the `*Unsafe` suffix, matching the convention Effect v4 adopted for its own throwing variants:

- `Rational.unsafeMake` → `Rational.makeUnsafe`, and likewise `reciprocalUnsafe`, `divideUnsafe`, `fromNumberUnsafe`, `toNumberUnsafe`, `fromStringUnsafe`
- `QuantityExact.unsafePer` → `perUnsafe`, and likewise `divideUnsafe`, `at_Unsafe`, `overUnsafe`, `over_Unsafe`, `fromQuantityUnsafe`, `toQuantityUnsafe`
- `TemperatureExact.unsafeFromTemperature` → `fromTemperatureUnsafe`, and `unsafeToTemperature` → `toTemperatureUnsafe`
