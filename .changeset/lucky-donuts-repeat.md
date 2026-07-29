---
"effect-units": minor
---

Add dimensionless quantities: `Dimensionless` and `DimensionlessExact`, built on a new `Unitless` base unit, with paired constructors and extractors for `fraction`, `percent`, `perMille`, `basisPoints`, `partsPerMillion`, and `partsPerBillion`, plus `zero`, `one`, and `complement`.

The unit algebra never cancels, so three new operations bridge between dimensionless and dimensioned quantities: `ratio` collapses same-unit division to `Unitless`, and `timesUnitless`/`overUnitless` apply a dimensionless factor without leaving the units they scale. `QuantityExact` gets the same three, with `ratioUnsafe` and `overUnitlessUnsafe` alongside the `Option`-returning forms.
