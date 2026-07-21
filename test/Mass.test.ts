import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as Mass from "../src/Mass.ts";

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

  testAnchors(Mass.inKilograms, [
    [Mass.grams, 1e-3],
    [Mass.milligrams, 1e-6],
    [Mass.micrograms, 1e-9],
    [Mass.nanograms, 1e-12],
    [Mass.metricTons, 1e3],
    [Mass.ounces, 0.45359237 / 16],
    [Mass.pounds, 0.45359237],
    [Mass.longTons, 1016.0469088],
    [Mass.shortTons, 907.18474],
  ]);

  it("relates pounds to ounces", () => {
    assertTrue(isCloseTo(Mass.inOunces(Mass.pounds(1)), 16));
  });
});
