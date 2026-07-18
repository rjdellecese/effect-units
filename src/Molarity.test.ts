import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Molarity from "./Molarity";
import * as Quantity from "./Quantity";
import * as SubstanceAmount from "./SubstanceAmount";
import * as Volume from "./Volume";

describe("Molarity", () => {
  testRoundtrips([
    [Molarity.molesPerCubicMeter, Molarity.inMolesPerCubicMeter],
    [Molarity.molesPerLiter, Molarity.inMolesPerLiter],
    [Molarity.decimolesPerLiter, Molarity.inDecimolesPerLiter],
    [Molarity.centimolesPerLiter, Molarity.inCentimolesPerLiter],
    [Molarity.millimolesPerLiter, Molarity.inMillimolesPerLiter],
    [Molarity.micromolesPerLiter, Molarity.inMicromolesPerLiter],
  ]);

  it("is a substance amount per a volume", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(SubstanceAmount.moles(10), Volume.cubicMeters(2)),
        Molarity.molesPerCubicMeter(5),
      ),
    );
  });

  it("relates moles per liter to moles and liters", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(SubstanceAmount.moles(1), Volume.liters(1)),
        Molarity.molesPerLiter(1),
      ),
    );
  });
});
