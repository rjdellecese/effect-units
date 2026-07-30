/**
 * The runtime side of treating `Unitless` as the identity of the unit
 * algebra. The float and exact tracks have to agree on this exactly, so
 * they share one definition.
 *
 * @module
 */
import type * as Unit from "../Unit.ts";

/**
 * The dimensionless leaf, and only that leaf: a `Unit.custom("Unitless")`
 * is a different unit—a custom leaf, encoded `"[Unitless]"`—and is never
 * folded away.
 */
export const isUnitless = (unit: Unit.Unit): unit is "Unitless" =>
  unit === "Unitless";

const isProduct = (
  unit: Unit.Unit,
): unit is Unit.Product<Unit.Unit, Unit.Unit> =>
  typeof unit !== "string" && unit._tag === "Product";

/**
 * The left factor of a product unit—the inverse of what `times` composed.
 *
 * A unit that is not a product is not a broken input. `times` folds a
 * dimensionless operand away, so a quantity whose static type is a
 * `Product` can carry the other factor's unit at runtime (reachable only
 * from code generic in its units—see `Quantity`'s note on {@link
 * isUnitless}). Dividing such a quantity by its right factor leaves the
 * factor that was folded, which was `Unitless` by construction: undoing the
 * fold rather than reaching for a `left` that isn't there.
 */
export const leftFactorOf = (unit: Unit.Unit): Unit.Unit =>
  isProduct(unit) ? unit.left : "Unitless";

/** The right factor of a product unit—{@link leftFactorOf} mirrored. */
export const rightFactorOf = (unit: Unit.Unit): Unit.Unit =>
  isProduct(unit) ? unit.right : "Unitless";
