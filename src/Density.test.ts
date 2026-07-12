import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Density from "./Density";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Volume from "./Volume";

describe("Density", () => {
  const roundtrip = [
    {
      there: Density.kilogramsPerCubicMeter,
      back: Density.inKilogramsPerCubicMeter,
    },
    {
      there: Density.gramsPerCubicCentimeter,
      back: Density.inGramsPerCubicCentimeter,
    },
    { there: Density.poundsPerCubicInch, back: Density.inPoundsPerCubicInch },
    { there: Density.poundsPerCubicFoot, back: Density.inPoundsPerCubicFoot },
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

  it("is a mass per a volume", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Mass.kilograms(BigDecimal.fromBigInt(10n)),
          Volume.cubicMeters(BigDecimal.fromBigInt(2n)),
        ),
        Density.kilogramsPerCubicMeter(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("relates grams per cubic centimeter to kilograms per cubic meter", () => {
    assertEquals(
      Density.inKilogramsPerCubicMeter(
        Density.gramsPerCubicCentimeter(BigDecimal.fromBigInt(1n)),
      ),
      BigDecimal.normalize(BigDecimal.fromBigInt(1000n)),
    );
  });
});
