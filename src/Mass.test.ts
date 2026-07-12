import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Mass from "./Mass";

describe("Mass", () => {
  // Metric
  testRoundtrip(Mass.kilograms, Mass.inKilograms);
  testRoundtrip(Mass.grams, Mass.inGrams);
  testRoundtrip(Mass.milligrams, Mass.inMilligrams);
  testRoundtrip(Mass.micrograms, Mass.inMicrograms);
  testRoundtrip(Mass.nanograms, Mass.inNanograms);
  testRoundtrip(Mass.metricTons, Mass.inMetricTons);

  // Imperial
  testRoundtrip(Mass.ounces, Mass.inOunces);
  testRoundtrip(Mass.pounds, Mass.inPounds);
  testRoundtrip(Mass.longTons, Mass.inLongTons);
  testRoundtrip(Mass.shortTons, Mass.inShortTons);

  it("relates pounds to ounces", () => {
    assertTrue(isCloseTo(Mass.inOunces(Mass.pounds(1)), 16));
  });
});
