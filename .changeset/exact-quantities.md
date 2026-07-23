---
"effect-units": minor
---

Add exact rational quantities: `Rational` (arbitrary-precision reduced bigint fractions in the `effect/BigDecimal` idiom), `ExactQuantity` (the exact interpreter of the unit algebra — same operations as `Quantity`, with the division family returning `Option` and rounding only at explicitly parameterized boundaries), and `Exact*` twins for every unit module whose conversion factors are exact rationals (all except the π-gated `Angle`, `AngularSpeed`, `AngularAcceleration`, and `SolidAngle`, plus `parsecs` and `footLamberts`). No changes to existing float behavior — float constants are test-pinned to their previous bit patterns.
