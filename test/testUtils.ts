import { it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Array from "effect/Array";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import type * as Quantity from "../src/Quantity.js";
import * as Unit from "../src/Unit.js";

export interface Tolerance {
  readonly relativeTolerance?: number;
  readonly absoluteTolerance?: number;
}

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
 * Float comparison within a relative tolerance, with an optional
 * absolute-tolerance fallback for additive operations whose error doesn't
 * scale with the operands (e.g. temperature offsets).
 */
export const isCloseTo = (
  actual: number,
  expected: number,
  { relativeTolerance = 1e-9, absoluteTolerance = 0 }: Tolerance = {},
): boolean =>
  actual === expected ||
  Math.abs(actual - expected) <=
    Math.max(
      relativeTolerance * Math.max(Math.abs(actual), Math.abs(expected)),
      absoluteTolerance,
    );

export const isQuantityCloseTo = <U extends Unit.Unit>(
  a: Quantity.Quantity<U>,
  b: Quantity.Quantity<U>,
  tolerance: Tolerance = {},
): boolean =>
  Unit.equals(a.unit, b.unit) && isCloseTo(a.value, b.value, tolerance);

/**
 * Registers a property test asserting that a constructor/extractor pair
 * roundtrips within tolerance. Call inside a `describe` block.
 */
export const testRoundtrip = <Q>(
  there: (n: number) => Q,
  back: (q: Q) => number,
  tolerance: Tolerance = {},
): void => {
  it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        assertTrue(isCloseTo(pipe(n, there, back), n, tolerance));
      }),
    );
  });
};

/**
 * Registers a {@link testRoundtrip} property test for each
 * constructor/extractor pair. Call inside a `describe` block.
 */
export const testRoundtrips = <Q>(
  pairs: ReadonlyArray<readonly [(n: number) => Q, (q: Q) => number]>,
  tolerance: Tolerance = {},
): void => {
  Array.forEach(pairs, ([there, back]) =>
    testRoundtrip(there, back, tolerance),
  );
};

/**
 * Registers a test anchoring each constructor's conversion factor to an
 * independently stated reference value: `toBase(there(1))` must be close to
 * `expected`. Roundtrip tests cancel the factor by construction, so without
 * anchors a mistyped constant would pass the suite; state `expected` as a
 * literal (or a ratio of literals), not by importing the source constant.
 */
export const testAnchors = <Q>(
  toBase: (q: Q) => number,
  anchors: ReadonlyArray<readonly [(n: number) => Q, number]>,
): void => {
  Array.forEach(anchors, ([there, expected]) => {
    it(`anchors '${there.name}' at ${expected}`, () => {
      assertTrue(
        isCloseTo(toBase(there(1)), expected, { relativeTolerance: 1e-12 }),
      );
    });
  });
};
