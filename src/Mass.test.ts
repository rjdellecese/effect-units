import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import { closeTo, double } from "./internal/testUtils";
import * as Mass from "./Mass";

describe("Mass", () => {
  const roundtrip = [
    // Metric
    { there: Mass.kilograms, back: Mass.inKilograms },
    { there: Mass.grams, back: Mass.inGrams },
    { there: Mass.milligrams, back: Mass.inMilligrams },
    { there: Mass.micrograms, back: Mass.inMicrograms },
    { there: Mass.nanograms, back: Mass.inNanograms },
    { there: Mass.metricTons, back: Mass.inMetricTons },

    // Imperial
    { there: Mass.ounces, back: Mass.inOunces },
    { there: Mass.pounds, back: Mass.inPounds },
    { there: Mass.longTons, back: Mass.inLongTons },
    { there: Mass.shortTons, back: Mass.inShortTons },
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

  it("relates pounds to ounces", () => {
    assertTrue(closeTo(Mass.inOunces(Mass.pounds(1)), 16));
  });
});
