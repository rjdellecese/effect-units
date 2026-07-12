import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import { closeTo, double } from "./internal/testUtils";
import * as Length from "./Length";

describe("Length", () => {
  const roundtrip = [
    // Metric
    { there: Length.angstroms, back: Length.inAngstroms },
    { there: Length.nanometers, back: Length.inNanometers },
    { there: Length.microns, back: Length.inMicrons },
    { there: Length.meters, back: Length.inMeters },
    { there: Length.kilometers, back: Length.inKilometers },
    { there: Length.centimeters, back: Length.inCentimeters },
    { there: Length.millimeters, back: Length.inMillimeters },

    // Imperial
    { there: Length.thou, back: Length.inThou },
    { there: Length.inches, back: Length.inInches },
    { there: Length.feet, back: Length.inFeet },
    { there: Length.yards, back: Length.inYards },
    { there: Length.miles, back: Length.inMiles },

    // Typography
    { there: Length.cssPixels, back: Length.inCssPixels },
    { there: Length.points, back: Length.inPoints },
    { there: Length.picas, back: Length.inPicas },

    // Astronomical
    { there: Length.astronomicalUnits, back: Length.inAstronomicalUnits },
    { there: Length.parsecs, back: Length.inParsecs },
    { there: Length.lightYears, back: Length.inLightYears },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("relates feet to inches", () => {
    assertTrue(closeTo(Length.inInches(Length.feet(1)), 12));
  });
});
