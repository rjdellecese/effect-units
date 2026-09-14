import * as Schema from "effect/Schema";
import * as Arbitrary from "effect/unstable/arbitrary/Arbitrary";
import { it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Array from "effect/Array";
import * as Equal from "effect/Equal";
import { pipe } from "effect/Function";

import * as Rational from "../src/Rational.ts";

/**
 * Bounded rational arbitrary: numerators within ±2^64, denominators within
 * 1..2^32. Bounded to keep property runs fast, not because anything
 * overflows—exact arithmetic has no range limits.
 */
export const rational = Arbitrary.all([
  Arbitrary.schema(
    Schema.BigInt.check(
      Schema.isBetweenBigInt({ minimum: -(2n ** 64n), maximum: 2n ** 64n }),
    ),
  ),
  Arbitrary.schema(
    Schema.BigInt.check(
      Schema.isBetweenBigInt({ minimum: 1n, maximum: 2n ** 32n }),
    ),
  ),
]).pipe(
  Arbitrary.map(([numerator, denominator]) =>
    Rational.makeUnsafe(numerator, denominator),
  ),
);

export const nonZeroRational = rational.pipe(
  Arbitrary.filter((r) => !Rational.isZero(r)),
);

/**
 * Registers a property test asserting that a constructor/extractor pair
 * roundtrips exactly—`Equal.equals` identity, no tolerance. Call inside a
 * `describe` block.
 */
export const testExactRoundtrip = <Q>(
  there: (r: Rational.Rational) => Q,
  back: (q: Q) => Rational.Rational,
): void => {
  it.prop(
    `roundtrips exactly between '${there.name}' and '${back.name}'`,
    [rational],
    ([r]) => {
      assertTrue(Equal.equals(pipe(r, there, back), r));
    },
  );
};

/**
 * Registers a {@link testExactRoundtrip} property test for each
 * constructor/extractor pair. Call inside a `describe` block.
 */
export const testExactRoundtrips = <Q>(
  pairs: ReadonlyArray<
    readonly [(r: Rational.Rational) => Q, (q: Q) => Rational.Rational]
  >,
): void => {
  Array.forEach(pairs, ([there, back]) => testExactRoundtrip(there, back));
};

/**
 * Registers a test anchoring each constructor's conversion factor to an
 * independently stated reference rational: `toBase(there(one))` must EQUAL
 * `expected`—exactly, not approximately. State `expected` as a literal
 * rational, not by importing the source constant, so a mistyped constant is
 * caught.
 */
export const testExactAnchors = <Q>(
  toBase: (q: Q) => Rational.Rational,
  anchors: ReadonlyArray<
    readonly [(r: Rational.Rational) => Q, Rational.Rational]
  >,
): void => {
  Array.forEach(anchors, ([there, expected]) => {
    it(`anchors '${there.name}' at ${Rational.format(expected)}`, () => {
      assertTrue(Equal.equals(toBase(there(Rational.one)), expected));
    });
  });
};
