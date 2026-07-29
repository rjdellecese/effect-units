---
"effect-units": minor
---

Require Effect v4.

`effect` is now a `^4.0.0-beta.102` peer dependency. Effect v4 is still in beta, so consumers need `effect@beta` (or a pinned `4.0.0-beta.*`).

The wire format is unchanged — quantities still encode as `{ unit, value }`, with exact values in the canonical rational encoding — so persisted data survives the upgrade. Two user-visible changes:

- `toString()` on quantities, temperatures, and rationals now emits compact JSON rather than 2-space-indented JSON, following Effect v4's formatter default. `toJSON()` is unchanged.
- Schema decoding and encoding now fail with Effect v4's `SchemaError` instead of `ParseResult.ParseError`, and the `Either`-returning entry points are now the `Result`-returning ones (`Schema.decodeUnknownResult`, `Schema.encodeResult`, …).

This package's schema names follow Effect v4's flipped convention, where the bare name is the identity schema and `XFromY` is the codec (as in `Schema.BigDecimal` / `Schema.BigDecimalFromString`). `FromSelf` is gone:

- `Unit.UnitFromSelf` → `Unit.Unit`; the old string codec `Unit.Unit` → `Unit.UnitFromString`
- `Rational.RationalFromSelf` → `Rational.Rational`; the old string codec `Rational.Rational` → `Rational.RationalFromString`
- `Quantity.QuantityFromSelf(unit)` → `Quantity.Quantity(unit)`; the old `{ unit, value }` codec → `Quantity.QuantityFromStruct(unit)`, and likewise for `QuantityExact`
- Every unit module's `XFromSelf` → `X`, and its old `X` codec → `XFromStruct` (`Length.LengthFromStruct`, `Speed.SpeedFromStruct`, …). Same for `Temperature` and `TemperatureExact`.

Comparison predicates take the `is` prefix that Effect v4 adopted for its own:

- `lessThan` → `isLessThan`, `lessThanOrEqualTo` → `isLessThanOrEqualTo`, `greaterThan` → `isGreaterThan`, `greaterThanOrEqualTo` → `isGreaterThanOrEqualTo` on `Quantity`, `QuantityExact`, `Rational`, `Temperature`, and `TemperatureExact`
- `Rational.between` → `Rational.isBetween`. Note `Duration.between` and `DurationExact.between` are unrelated — they measure the duration between two instants — and keep their names.

This package's own `unsafe*` functions move to the `*Unsafe` suffix, matching the convention Effect v4 adopted for its own throwing variants:

- `Rational.unsafeMake` → `Rational.makeUnsafe`, and likewise `reciprocalUnsafe`, `divideUnsafe`, `fromNumberUnsafe`, `toNumberUnsafe`, `fromStringUnsafe`
- `QuantityExact.unsafePer` → `perUnsafe`, and likewise `divideUnsafe`, `at_Unsafe`, `overUnsafe`, `over_Unsafe`, `fromQuantityUnsafe`, `toQuantityUnsafe`
- `TemperatureExact.unsafeFromTemperature` → `fromTemperatureUnsafe`, and `unsafeToTemperature` → `toTemperatureUnsafe`
