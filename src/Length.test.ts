import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Length from "./Length";

describe("Length", () => {
  // Metric
  testRoundtrip(Length.angstroms, Length.inAngstroms);
  testRoundtrip(Length.nanometers, Length.inNanometers);
  testRoundtrip(Length.microns, Length.inMicrons);
  testRoundtrip(Length.meters, Length.inMeters);
  testRoundtrip(Length.kilometers, Length.inKilometers);
  testRoundtrip(Length.centimeters, Length.inCentimeters);
  testRoundtrip(Length.millimeters, Length.inMillimeters);

  // Imperial
  testRoundtrip(Length.thou, Length.inThou);
  testRoundtrip(Length.inches, Length.inInches);
  testRoundtrip(Length.feet, Length.inFeet);
  testRoundtrip(Length.yards, Length.inYards);
  testRoundtrip(Length.miles, Length.inMiles);

  // Typography
  testRoundtrip(Length.cssPixels, Length.inCssPixels);
  testRoundtrip(Length.points, Length.inPoints);
  testRoundtrip(Length.picas, Length.inPicas);

  // Astronomical
  testRoundtrip(Length.astronomicalUnits, Length.inAstronomicalUnits);
  testRoundtrip(Length.parsecs, Length.inParsecs);
  testRoundtrip(Length.lightYears, Length.inLightYears);

  it("relates feet to inches", () => {
    assertTrue(isCloseTo(Length.inInches(Length.feet(1)), 12));
  });
});
