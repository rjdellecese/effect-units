import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Molarity from "./Molarity";
import * as Quantity from "./Quantity";
import * as SubstanceAmount from "./SubstanceAmount";
import * as Volume from "./Volume";

describe("Molarity", () => {
  testRoundtrip(Molarity.molesPerCubicMeter, Molarity.inMolesPerCubicMeter);
  testRoundtrip(Molarity.molesPerLiter, Molarity.inMolesPerLiter);
  testRoundtrip(Molarity.decimolesPerLiter, Molarity.inDecimolesPerLiter);
  testRoundtrip(Molarity.centimolesPerLiter, Molarity.inCentimolesPerLiter);
  testRoundtrip(Molarity.millimolesPerLiter, Molarity.inMillimolesPerLiter);
  testRoundtrip(Molarity.micromolesPerLiter, Molarity.inMicromolesPerLiter);

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
