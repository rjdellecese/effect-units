import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Density from "./Density.ts";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.ts";
import * as Mass from "./Mass.ts";
import * as Quantity from "./Quantity.ts";
import * as Volume from "./Volume.ts";

describe("Density", () => {
  testRoundtrips([
    [Density.kilogramsPerCubicMeter, Density.inKilogramsPerCubicMeter],
    [Density.gramsPerCubicCentimeter, Density.inGramsPerCubicCentimeter],
    [Density.poundsPerCubicInch, Density.inPoundsPerCubicInch],
    [Density.poundsPerCubicFoot, Density.inPoundsPerCubicFoot],
  ]);

  testAnchors(Density.inKilogramsPerCubicMeter, [
    [Density.gramsPerCubicCentimeter, 1000],
    [Density.poundsPerCubicInch, 0.45359237 / 1.6387064e-5],
    [Density.poundsPerCubicFoot, 0.45359237 / 0.028316846592],
  ]);

  it("is a mass per a volume", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Mass.kilograms(10), Volume.cubicMeters(2)),
        Density.kilogramsPerCubicMeter(5),
      ),
    );
  });

  it("relates grams per cubic centimeter to kilograms per cubic meter", () => {
    assertTrue(
      isCloseTo(
        Density.inKilogramsPerCubicMeter(Density.gramsPerCubicCentimeter(1)),
        1000,
      ),
    );
  });
});
