import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as MassExact from "../src/MassExact.ts";
import * as Mass from "../src/Mass.ts";
import * as Rational from "../src/Rational.ts";

describe("MassExact", () => {
  testExactRoundtrips([
    [MassExact.kilograms, MassExact.inKilograms],
    [MassExact.grams, MassExact.inGrams],
    [MassExact.milligrams, MassExact.inMilligrams],
    [MassExact.micrograms, MassExact.inMicrograms],
    [MassExact.nanograms, MassExact.inNanograms],
    [MassExact.metricTons, MassExact.inMetricTons],
    [MassExact.ounces, MassExact.inOunces],
    [MassExact.pounds, MassExact.inPounds],
    [MassExact.longTons, MassExact.inLongTons],
    [MassExact.shortTons, MassExact.inShortTons],
  ]);

  testExactAnchors(MassExact.inKilograms, [
    [MassExact.grams, Rational.makeUnsafe(1n, 1000n)],
    [MassExact.milligrams, Rational.makeUnsafe(1n, 10n ** 6n)],
    [MassExact.micrograms, Rational.makeUnsafe(1n, 10n ** 9n)],
    [MassExact.nanograms, Rational.makeUnsafe(1n, 10n ** 12n)],
    [MassExact.metricTons, Rational.makeUnsafe(1000n)],
    [MassExact.ounces, Rational.makeUnsafe(45359237n, 1600000000n)],
    [MassExact.pounds, Rational.makeUnsafe(45359237n, 100000000n)],
    [MassExact.longTons, Rational.makeUnsafe(317514659n, 312500n)],
    [MassExact.shortTons, Rational.makeUnsafe(45359237n, 50000n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        MassExact.inOunces(MassExact.pounds(Rational.one)),
        Rational.makeUnsafe(16n),
      ),
    );
    assertTrue(
      Equal.equals(
        MassExact.inPounds(MassExact.longTons(Rational.one)),
        Rational.makeUnsafe(2240n),
      ),
    );
    assertTrue(
      Equal.equals(
        MassExact.inPounds(MassExact.shortTons(Rational.one)),
        Rational.makeUnsafe(2000n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [MassExact.grams, Mass.grams],
      [MassExact.milligrams, Mass.milligrams],
      [MassExact.micrograms, Mass.micrograms],
      [MassExact.nanograms, Mass.nanograms],
      [MassExact.metricTons, Mass.metricTons],
      [MassExact.ounces, Mass.ounces],
      [MassExact.pounds, Mass.pounds],
      [MassExact.longTons, Mass.longTons],
      [MassExact.shortTons, Mass.shortTons],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
