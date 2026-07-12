import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Area from "./Area";
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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("is the product of an area and a length", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Area.squareMeters(BigDecimal.fromBigInt(6n)),
          Length.meters(BigDecimal.fromBigInt(2n)),
        ),
        Volume.cubicMeters(BigDecimal.fromBigInt(12n)),
      ),
    );
  });

  it("is the cube of a length", () => {
    assertTrue(
      Equal.equals(
        Quantity.cubed(Length.inches(BigDecimal.fromBigInt(1n))),
        Volume.cubicInches(BigDecimal.fromBigInt(1n)),
      ),
    );
  });

  it("relates gallons to quarts, pints, and fluid ounces exactly", () => {
    const gallon = Volume.usLiquidGallons(BigDecimal.fromBigInt(1n));

    assertEquals(
      Volume.inUsLiquidQuarts(gallon),
      BigDecimal.normalize(BigDecimal.fromBigInt(4n)),
    );
    assertEquals(
      Volume.inUsLiquidPints(gallon),
      BigDecimal.normalize(BigDecimal.fromBigInt(8n)),
    );
    assertEquals(
      Volume.inUsFluidOunces(gallon),
      BigDecimal.normalize(BigDecimal.fromBigInt(128n)),
    );
  });
});
