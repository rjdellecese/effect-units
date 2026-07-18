import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Length from "./Length";

describe("Length", () => {
  testRoundtrips([
    // Metric
    [Length.angstroms, Length.inAngstroms],
    [Length.nanometers, Length.inNanometers],
    [Length.microns, Length.inMicrons],
    [Length.meters, Length.inMeters],
    [Length.kilometers, Length.inKilometers],
    [Length.centimeters, Length.inCentimeters],
    [Length.millimeters, Length.inMillimeters],

    // Imperial
    [Length.thou, Length.inThou],
    [Length.inches, Length.inInches],
    [Length.feet, Length.inFeet],
    [Length.yards, Length.inYards],
    [Length.miles, Length.inMiles],

    // Typography
    [Length.cssPixels, Length.inCssPixels],
    [Length.points, Length.inPoints],
    [Length.picas, Length.inPicas],

    // Astronomical
    [Length.astronomicalUnits, Length.inAstronomicalUnits],
    [Length.parsecs, Length.inParsecs],
    [Length.lightYears, Length.inLightYears],
  ]);

  it("relates feet to inches", () => {
    assertTrue(isCloseTo(Length.inInches(Length.feet(1)), 12));
  });
});
