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
    [ExactMass.grams, Rational.unsafeMake(1n, 1000n)],
    [ExactMass.milligrams, Rational.unsafeMake(1n, 10n ** 6n)],
    [ExactMass.micrograms, Rational.unsafeMake(1n, 10n ** 9n)],
    [ExactMass.nanograms, Rational.unsafeMake(1n, 10n ** 12n)],
    [ExactMass.metricTons, Rational.unsafeMake(1000n)],
    [ExactMass.ounces, Rational.unsafeMake(45359237n, 1600000000n)],
    [ExactMass.pounds, Rational.unsafeMake(45359237n, 100000000n)],
    [ExactMass.longTons, Rational.unsafeMake(317514659n, 312500n)],
    [ExactMass.shortTons, Rational.unsafeMake(45359237n, 50000n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactMass.inOunces(ExactMass.pounds(Rational.one)),
        Rational.unsafeMake(16n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactMass.inPounds(ExactMass.longTons(Rational.one)),
        Rational.unsafeMake(2240n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactMass.inPounds(ExactMass.shortTons(Rational.one)),
        Rational.unsafeMake(2000n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactMass.grams, Mass.grams],
      [ExactMass.milligrams, Mass.milligrams],
      [ExactMass.micrograms, Mass.micrograms],
      [ExactMass.nanograms, Mass.nanograms],
      [ExactMass.metricTons, Mass.metricTons],
      [ExactMass.ounces, Mass.ounces],
      [ExactMass.pounds, Mass.pounds],
      [ExactMass.longTons, Mass.longTons],
      [ExactMass.shortTons, Mass.shortTons],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
