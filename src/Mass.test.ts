import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Mass from "./Mass";

describe("Mass", () => {
  testRoundtrips([
    // Metric
    [Mass.kilograms, Mass.inKilograms],
    [Mass.grams, Mass.inGrams],
    [Mass.milligrams, Mass.inMilligrams],
    [Mass.micrograms, Mass.inMicrograms],
    [Mass.nanograms, Mass.inNanograms],
    [Mass.metricTons, Mass.inMetricTons],

    // Imperial
    [Mass.ounces, Mass.inOunces],
    [Mass.pounds, Mass.inPounds],
    [Mass.longTons, Mass.inLongTons],
    [Mass.shortTons, Mass.inShortTons],
  ]);

  it("relates pounds to ounces", () => {
    assertTrue(isCloseTo(Mass.inOunces(Mass.pounds(1)), 16));
  });
});
