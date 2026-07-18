import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Density from "./Density";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrips,
} from "./internal/testUtils";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Volume from "./Volume";

describe("Density", () => {
  testRoundtrips([
    [Density.kilogramsPerCubicMeter, Density.inKilogramsPerCubicMeter],
    [Density.gramsPerCubicCentimeter, Density.inGramsPerCubicCentimeter],
    [Density.poundsPerCubicInch, Density.inPoundsPerCubicInch],
    [Density.poundsPerCubicFoot, Density.inPoundsPerCubicFoot],
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
