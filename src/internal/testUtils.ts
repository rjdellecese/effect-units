import * as FastCheck from "effect/FastCheck";

import * as Quantity from "../Quantity";
import * as Unit from "../Unit";

/**
 * Finite doubles bounded so that no conversion factor in the library can
 * overflow to Infinity or underflow to a subnormal during a roundtrip
 * (magnitudes below 1e-30 collapse to zero).
 */
export const double = FastCheck.double({
  min: -1e30,
  max: 1e30,
  noNaN: true,
}).map((n) => (Math.abs(n) < 1e-30 ? 0 : n));

/**
 * Float comparison within a relative tolerance, with an absolute-tolerance
 * fallback for additive operations whose error doesn't scale with the
 * operands (e.g. temperature offsets).
 */
export const closeTo = (
  actual: number,
  expected: number,
  relativeTolerance = 1e-9,
  absoluteTolerance = 0,
): boolean =>
  actual === expected ||
  Math.abs(actual - expected) <=
    Math.max(
      relativeTolerance * Math.max(Math.abs(actual), Math.abs(expected)),
      absoluteTolerance,
    );

export const quantityCloseTo = <U extends Unit.Unit>(
  a: Quantity.Quantity<U>,
  b: Quantity.Quantity<U>,
  relativeTolerance = 1e-9,
): boolean =>
  Unit.equals(a.unit, b.unit) && closeTo(a.value, b.value, relativeTolerance);
