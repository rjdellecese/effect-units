import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as Length from "../src/Length.ts";
import * as Rational from "../src/Rational.ts";

describe("LengthExact", () => {
  testExactRoundtrips([
    [LengthExact.angstroms, LengthExact.inAngstroms],
    [LengthExact.nanometers, LengthExact.inNanometers],
    [LengthExact.microns, LengthExact.inMicrons],
    [LengthExact.kilometers, LengthExact.inKilometers],
    [LengthExact.meters, LengthExact.inMeters],
    [LengthExact.centimeters, LengthExact.inCentimeters],
    [LengthExact.millimeters, LengthExact.inMillimeters],
    [LengthExact.thou, LengthExact.inThou],
    [LengthExact.inches, LengthExact.inInches],
    [LengthExact.feet, LengthExact.inFeet],
    [LengthExact.yards, LengthExact.inYards],
    [LengthExact.miles, LengthExact.inMiles],
    [LengthExact.cssPixels, LengthExact.inCssPixels],
    [LengthExact.points, LengthExact.inPoints],
    [LengthExact.picas, LengthExact.inPicas],
    [LengthExact.astronomicalUnits, LengthExact.inAstronomicalUnits],
    [LengthExact.lightYears, LengthExact.inLightYears],
  ]);

  testExactAnchors(LengthExact.inMeters, [
    [LengthExact.angstroms, Rational.makeUnsafe(1n, 10n ** 10n)],
    [LengthExact.nanometers, Rational.makeUnsafe(1n, 10n ** 9n)],
    [LengthExact.kilometers, Rational.makeUnsafe(1000n)],
    [LengthExact.centimeters, Rational.makeUnsafe(1n, 100n)],
    [LengthExact.thou, Rational.makeUnsafe(127n, 5000000n)],
    [LengthExact.inches, Rational.makeUnsafe(127n, 5000n)],
    [LengthExact.feet, Rational.makeUnsafe(381n, 1250n)],
    [LengthExact.yards, Rational.makeUnsafe(1143n, 1250n)],
    [LengthExact.miles, Rational.makeUnsafe(201168n, 125n)],
    [LengthExact.cssPixels, Rational.makeUnsafe(127n, 480000n)],
    [LengthExact.points, Rational.makeUnsafe(127n, 360000n)],
    [LengthExact.picas, Rational.makeUnsafe(127n, 30000n)],
    [LengthExact.astronomicalUnits, Rational.makeUnsafe(149597870700n)],
    [LengthExact.lightYears, Rational.makeUnsafe(9460730472580800n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        LengthExact.inInches(LengthExact.feet(Rational.one)),
        Rational.makeUnsafe(12n),
      ),
    );
    assertTrue(
      Equal.equals(
        LengthExact.inFeet(LengthExact.miles(Rational.one)),
        Rational.makeUnsafe(5280n),
      ),
    );
    assertTrue(
      Equal.equals(
        LengthExact.inThou(LengthExact.inches(Rational.one)),
        Rational.makeUnsafe(1000n),
      ),
    );
    assertTrue(
      Equal.equals(
        LengthExact.inCentimeters(LengthExact.inches(Rational.one)),
        Rational.makeUnsafe(127n, 50n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [LengthExact.inches, Length.inches],
      [LengthExact.feet, Length.feet],
      [LengthExact.yards, Length.yards],
      [LengthExact.miles, Length.miles],
      [LengthExact.points, Length.points],
      [LengthExact.astronomicalUnits, Length.astronomicalUnits],
      [LengthExact.lightYears, Length.lightYears],
      [LengthExact.angstroms, Length.angstroms],
      [LengthExact.nanometers, Length.nanometers],
      [LengthExact.kilometers, Length.kilometers],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
