import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactLength from "../src/ExactLength.ts";
import * as Length from "../src/Length.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactLength", () => {
  testExactRoundtrips([
    [ExactLength.angstroms, ExactLength.inAngstroms],
    [ExactLength.nanometers, ExactLength.inNanometers],
    [ExactLength.microns, ExactLength.inMicrons],
    [ExactLength.kilometers, ExactLength.inKilometers],
    [ExactLength.meters, ExactLength.inMeters],
    [ExactLength.centimeters, ExactLength.inCentimeters],
    [ExactLength.millimeters, ExactLength.inMillimeters],
    [ExactLength.thou, ExactLength.inThou],
    [ExactLength.inches, ExactLength.inInches],
    [ExactLength.feet, ExactLength.inFeet],
    [ExactLength.yards, ExactLength.inYards],
    [ExactLength.miles, ExactLength.inMiles],
    [ExactLength.cssPixels, ExactLength.inCssPixels],
    [ExactLength.points, ExactLength.inPoints],
    [ExactLength.picas, ExactLength.inPicas],
    [ExactLength.astronomicalUnits, ExactLength.inAstronomicalUnits],
    [ExactLength.lightYears, ExactLength.inLightYears],
  ]);

  testExactAnchors(ExactLength.inMeters, [
    [ExactLength.angstroms, Rational.unsafeMake(1n, 10n ** 10n)],
    [ExactLength.nanometers, Rational.unsafeMake(1n, 10n ** 9n)],
    [ExactLength.kilometers, Rational.unsafeMake(1000n)],
    [ExactLength.centimeters, Rational.unsafeMake(1n, 100n)],
    [ExactLength.thou, Rational.unsafeMake(127n, 5000000n)],
    [ExactLength.inches, Rational.unsafeMake(127n, 5000n)],
    [ExactLength.feet, Rational.unsafeMake(381n, 1250n)],
    [ExactLength.yards, Rational.unsafeMake(1143n, 1250n)],
    [ExactLength.miles, Rational.unsafeMake(201168n, 125n)],
    [ExactLength.cssPixels, Rational.unsafeMake(127n, 480000n)],
    [ExactLength.points, Rational.unsafeMake(127n, 360000n)],
    [ExactLength.picas, Rational.unsafeMake(127n, 30000n)],
    [ExactLength.astronomicalUnits, Rational.unsafeMake(149597870700n)],
    [ExactLength.lightYears, Rational.unsafeMake(9460730472580800n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactLength.inInches(ExactLength.feet(Rational.one)),
        Rational.unsafeMake(12n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactLength.inFeet(ExactLength.miles(Rational.one)),
        Rational.unsafeMake(5280n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactLength.inThou(ExactLength.inches(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactLength.inCentimeters(ExactLength.inches(Rational.one)),
        Rational.unsafeMake(127n, 50n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactLength.inches, Length.inches],
      [ExactLength.feet, Length.feet],
      [ExactLength.yards, Length.yards],
      [ExactLength.miles, Length.miles],
      [ExactLength.points, Length.points],
      [ExactLength.astronomicalUnits, Length.astronomicalUnits],
      [ExactLength.lightYears, Length.lightYears],
      [ExactLength.angstroms, Length.angstroms],
      [ExactLength.nanometers, Length.nanometers],
      [ExactLength.kilometers, Length.kilometers],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
