---
"effect-units": minor
---

Rename the exact modules from an `Exact` prefix to an `Exact` suffix: `effect-units/ExactQuantity` is now `effect-units/QuantityExact`, `effect-units/ExactLength` is now `effect-units/LengthExact`, and so on for every exact twin. The exported schema, type, and `*FromSelf` names move with them (`ExactMass` → `MassExact`, `ExactMassFromSelf` → `MassExactFromSelf`), as does the `QuantityExact` `TypeId` symbol and its `toJSON` `_id`.
