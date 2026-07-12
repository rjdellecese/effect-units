import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrip,
} from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Volume from "./Volume";

describe("Volume", () => {
  // Metric
  testRoundtrip(Volume.cubicMeters, Volume.inCubicMeters);
  testRoundtrip(Volume.liters, Volume.inLiters);
  testRoundtrip(Volume.milliliters, Volume.inMilliliters);
  testRoundtrip(Volume.cubicCentimeters, Volume.inCubicCentimeters);

  // Imperial
  testRoundtrip(Volume.cubicInches, Volume.inCubicInches);
  testRoundtrip(Volume.cubicFeet, Volume.inCubicFeet);
  testRoundtrip(Volume.cubicYards, Volume.inCubicYards);

  // US liquid
  testRoundtrip(Volume.usLiquidGallons, Volume.inUsLiquidGallons);
  testRoundtrip(Volume.usLiquidQuarts, Volume.inUsLiquidQuarts);
  testRoundtrip(Volume.usLiquidPints, Volume.inUsLiquidPints);
  testRoundtrip(Volume.usFluidOunces, Volume.inUsFluidOunces);

  // US dry
  testRoundtrip(Volume.usDryGallons, Volume.inUsDryGallons);
  testRoundtrip(Volume.usDryQuarts, Volume.inUsDryQuarts);
  testRoundtrip(Volume.usDryPints, Volume.inUsDryPints);

  // Imperial (UK)
  testRoundtrip(Volume.imperialGallons, Volume.inImperialGallons);
  testRoundtrip(Volume.imperialQuarts, Volume.inImperialQuarts);
  testRoundtrip(Volume.imperialPints, Volume.inImperialPints);
  testRoundtrip(Volume.imperialFluidOunces, Volume.inImperialFluidOunces);

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
