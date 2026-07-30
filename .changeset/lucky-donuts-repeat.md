---
"effect-units": minor
---

Add dimensionless quantities: `Dimensionless` and `DimensionlessExact`, built on a new `Unitless` base unit, with paired constructors and extractors for `fraction`, `percent`, `perMille`, `basisPoints`, `partsPerMillion`, and `partsPerBillion`, plus `zero`, `one`, and `complement`.

`Unitless` is the identity of the unit algebra, so the existing arithmetic absorbs it rather than growing a parallel set of operations: `times`, `over`, `over_`, `squared`, and `cubed` (on both `Quantity` and `QuantityExact`) fold a dimensionless operand away instead of composing with it, each through an overload that keeps the general `Product` behavior untouched. The one operation that is genuinely new is `ratio`, which divides two quantities in the same units and returns the pure number rather than the `Rate<U, U>` that `per` would build; `QuantityExact` also gets `ratioUnsafe` alongside the `Option`-returning form.
