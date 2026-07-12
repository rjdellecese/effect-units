import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Area from "./Area";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Volume from "./Volume";

describe("Volume", () => {
  const roundtrip = [
    // Metric
    { there: Volume.cubicMeters, back: Volume.inCubicMeters },
    { there: Volume.liters, back: Volume.inLiters },
    { there: Volume.milliliters, back: Volume.inMilliliters },
    { there: Volume.cubicCentimeters, back: Volume.inCubicCentimeters },

    // Imperial
    { there: Volume.cubicInches, back: Volume.inCubicInches },
    { there: Volume.cubicFeet, back: Volume.inCubicFeet },
    { there: Volume.cubicYards, back: Volume.inCubicYards },

    // US liquid
    { there: Volume.usLiquidGallons, back: Volume.inUsLiquidGallons },
    { there: Volume.usLiquidQuarts, back: Volume.inUsLiquidQuarts },
    { there: Volume.usLiquidPints, back: Volume.inUsLiquidPints },
    { there: Volume.usFluidOunces, back: Volume.inUsFluidOunces },

    // US dry
    { there: Volume.usDryGallons, back: Volume.inUsDryGallons },
    { there: Volume.usDryQuarts, back: Volume.inUsDryQuarts },
    { there: Volume.usDryPints, back: Volume.inUsDryPints },

    // Imperial (UK)
    { there: Volume.imperialGallons, back: Volume.inImperialGallons },
    { there: Volume.imperialQuarts, back: Volume.inImperialQuarts },
    { there: Volume.imperialPints, back: Volume.inImperialPints },
    { there: Volume.imperialFluidOunces, back: Volume.inImperialFluidOunces },
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

  it("is the product of an area and a length", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(Area.squareMeters(6), Length.meters(2)),
        Volume.cubicMeters(12),
      ),
    );
  });

  it("is the cube of a length", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.cubed(Length.inches(1)),
        Volume.cubicInches(1),
      ),
    );
  });

  it("relates gallons to quarts, pints, and fluid ounces", () => {
    const gallon = Volume.usLiquidGallons(1);

    assertTrue(closeTo(Volume.inUsLiquidQuarts(gallon), 4));
    assertTrue(closeTo(Volume.inUsLiquidPints(gallon), 8));
    assertTrue(closeTo(Volume.inUsFluidOunces(gallon), 128));
  });
});
