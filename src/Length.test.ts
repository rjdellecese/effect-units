import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testAnchors, testRoundtrips } from "./internal/testUtils";
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

  testAnchors(Length.inMeters, [
    [Length.angstroms, 1e-10],
    [Length.nanometers, 1e-9],
    [Length.microns, 1e-6],
    [Length.millimeters, 1e-3],
    [Length.centimeters, 1e-2],
    [Length.kilometers, 1e3],
    [Length.thou, 2.54e-5],
    [Length.inches, 0.0254],
    [Length.feet, 0.3048],
    [Length.yards, 0.9144],
    [Length.miles, 1609.344],
    [Length.cssPixels, 0.0254 / 96],
    [Length.points, 0.0254 / 72],
    [Length.picas, 0.0254 / 6],
    [Length.astronomicalUnits, 149597870700],
    [Length.parsecs, (648000 / Math.PI) * 149597870700],
    [Length.lightYears, 9460730472580800],
  ]);

  it("relates feet to inches", () => {
    assertTrue(isCloseTo(Length.inInches(Length.feet(1)), 12));
  });
});
