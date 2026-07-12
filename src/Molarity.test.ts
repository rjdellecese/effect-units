import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Molarity from "./Molarity";
import * as Quantity from "./Quantity";
import * as SubstanceAmount from "./SubstanceAmount";
import * as Volume from "./Volume";

describe("Molarity", () => {
  const roundtrip = [
    {
      there: Molarity.molesPerCubicMeter,
      back: Molarity.inMolesPerCubicMeter,
    },
    { there: Molarity.molesPerLiter, back: Molarity.inMolesPerLiter },
    { there: Molarity.decimolesPerLiter, back: Molarity.inDecimolesPerLiter },
    {
      there: Molarity.centimolesPerLiter,
      back: Molarity.inCentimolesPerLiter,
    },
    {
      there: Molarity.millimolesPerLiter,
      back: Molarity.inMillimolesPerLiter,
    },
    {
      there: Molarity.micromolesPerLiter,
      back: Molarity.inMicromolesPerLiter,
    },
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

  it("is a substance amount per a volume", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(SubstanceAmount.moles(10), Volume.cubicMeters(2)),
        Molarity.molesPerCubicMeter(5),
      ),
    );
  });

  it("relates moles per liter to moles and liters", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(SubstanceAmount.moles(1), Volume.liters(1)),
        Molarity.molesPerLiter(1),
      ),
    );
  });
});
