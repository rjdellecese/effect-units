import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area.js";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Length from "./Length.js";
import * as Quantity from "./Quantity.js";
import * as Volume from "./Volume.js";

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

  testAnchors(Volume.inCubicMeters, [
    [Volume.liters, 1e-3],
    [Volume.milliliters, 1e-6],
    [Volume.cubicCentimeters, 1e-6],
    [Volume.cubicInches, 1.6387064e-5],
    [Volume.cubicFeet, 0.028316846592],
    [Volume.cubicYards, 0.764554857984],
    [Volume.usLiquidGallons, 3.785411784e-3],
    [Volume.usLiquidQuarts, 3.785411784e-3 / 4],
    [Volume.usLiquidPints, 3.785411784e-3 / 8],
    [Volume.usFluidOunces, 3.785411784e-3 / 128],
    [Volume.usDryGallons, 4.40488377086e-3],
    [Volume.usDryQuarts, 4.40488377086e-3 / 4],
    [Volume.usDryPints, 4.40488377086e-3 / 8],
    [Volume.imperialGallons, 4.54609e-3],
    [Volume.imperialQuarts, 4.54609e-3 / 4],
    [Volume.imperialPints, 4.54609e-3 / 8],
    [Volume.imperialFluidOunces, 4.54609e-3 / 160],
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
