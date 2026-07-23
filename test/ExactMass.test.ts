import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactMass from "../src/ExactMass.ts";
import * as Mass from "../src/Mass.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactMass", () => {
  testExactRoundtrips([
    [ExactMass.kilograms, ExactMass.inKilograms],
    [ExactMass.grams, ExactMass.inGrams],
    [ExactMass.milligrams, ExactMass.inMilligrams],
    [ExactMass.micrograms, ExactMass.inMicrograms],
    [ExactMass.nanograms, ExactMass.inNanograms],
    [ExactMass.metricTons, ExactMass.inMetricTons],
    [ExactMass.ounces, ExactMass.inOunces],
    [ExactMass.pounds, ExactMass.inPounds],
    [ExactMass.longTons, ExactMass.inLongTons],
    [ExactMass.shortTons, ExactMass.inShortTons],
  ]);

  testExactAnchors(ExactMass.inKilograms, [
    [ExactMass.grams, Rational.make(1n, 1000n)],
    [ExactMass.milligrams, Rational.make(1n, 10n ** 6n)],
    [ExactMass.micrograms, Rational.make(1n, 10n ** 9n)],
    [ExactMass.nanograms, Rational.make(1n, 10n ** 12n)],
    [ExactMass.metricTons, Rational.make(1000n)],
    [ExactMass.ounces, Rational.make(45359237n, 1600000000n)],
    [ExactMass.pounds, Rational.make(45359237n, 100000000n)],
    [ExactMass.longTons, Rational.make(317514659n, 312500n)],
    [ExactMass.shortTons, Rational.make(45359237n, 50000n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactMass.inOunces(ExactMass.pounds(Rational.one)),
        Rational.make(16n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactMass.inPounds(ExactMass.longTons(Rational.one)),
        Rational.make(2240n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactMass.inPounds(ExactMass.shortTons(Rational.one)),
        Rational.make(2000n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    // longTons is excluded: the float chain (0.45359237 * 2240) double-rounds
    // one ulp above the correctly rounded exact value, and the float side
    // keeps its historical value by design. Ounces divide the pound by a
    // power of two, so that float chain stays exact.
    for (const [exactCtor, floatCtor] of [
      [ExactMass.grams, Mass.grams],
      [ExactMass.metricTons, Mass.metricTons],
      [ExactMass.ounces, Mass.ounces],
      [ExactMass.pounds, Mass.pounds],
      [ExactMass.shortTons, Mass.shortTons],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
