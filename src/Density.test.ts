import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Density from "./Density";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
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
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("is a mass per a volume", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Mass.kilograms(10), Volume.cubicMeters(2)),
        Density.kilogramsPerCubicMeter(5),
      ),
    );
  });

  it("relates grams per cubic centimeter to kilograms per cubic meter", () => {
    assertTrue(
      closeTo(
        Density.inKilogramsPerCubicMeter(Density.gramsPerCubicCentimeter(1)),
        1000,
      ),
    );
  });
});
