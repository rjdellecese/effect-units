import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrips,
} from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Volume from "./Volume";

describe("Volume", () => {
  testRoundtrips([
    // Metric
    [Volume.cubicMeters, Volume.inCubicMeters],
    [Volume.liters, Volume.inLiters],
    [Volume.milliliters, Volume.inMilliliters],
    [Volume.cubicCentimeters, Volume.inCubicCentimeters],

    // Imperial
    [Volume.cubicInches, Volume.inCubicInches],
    [Volume.cubicFeet, Volume.inCubicFeet],
    [Volume.cubicYards, Volume.inCubicYards],

    // US liquid
    [Volume.usLiquidGallons, Volume.inUsLiquidGallons],
    [Volume.usLiquidQuarts, Volume.inUsLiquidQuarts],
    [Volume.usLiquidPints, Volume.inUsLiquidPints],
    [Volume.usFluidOunces, Volume.inUsFluidOunces],

    // US dry
    [Volume.usDryGallons, Volume.inUsDryGallons],
    [Volume.usDryQuarts, Volume.inUsDryQuarts],
    [Volume.usDryPints, Volume.inUsDryPints],

    // Imperial (UK)
    [Volume.imperialGallons, Volume.inImperialGallons],
    [Volume.imperialQuarts, Volume.inImperialQuarts],
    [Volume.imperialPints, Volume.inImperialPints],
    [Volume.imperialFluidOunces, Volume.inImperialFluidOunces],
  ]);

  it("is the product of an area and a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Area.squareMeters(6), Length.meters(2)),
        Volume.cubicMeters(12),
      ),
    );
  });

  it("is the cube of a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.cubed(Length.inches(1)),
        Volume.cubicInches(1),
      ),
    );
  });

  it("relates gallons to quarts, pints, and fluid ounces", () => {
    const gallon = Volume.usLiquidGallons(1);

    assertTrue(isCloseTo(Volume.inUsLiquidQuarts(gallon), 4));
    assertTrue(isCloseTo(Volume.inUsLiquidPints(gallon), 8));
    assertTrue(isCloseTo(Volume.inUsFluidOunces(gallon), 128));
  });
});
