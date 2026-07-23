---
"effect-units": minor
---

Add user-defined custom base units: `Unit.custom("USD")` creates a `Unit.Custom<"USD">` leaf that composes with `Product`/`Rate` and all `Quantity` arithmetic, encoding as `[USD]` on the wire.
