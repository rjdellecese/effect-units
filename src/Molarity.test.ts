import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Molarity from "./Molarity.js";
import * as Quantity from "./Quantity.js";
import * as SubstanceAmount from "./SubstanceAmount.js";
import * as Volume from "./Volume.js";

describe("Molarity", () => {
  testRoundtrips([
    [Molarity.molesPerCubicMeter, Molarity.inMolesPerCubicMeter],
    [Molarity.molesPerLiter, Molarity.inMolesPerLiter],
    [Molarity.decimolesPerLiter, Molarity.inDecimolesPerLiter],
    [Molarity.centimolesPerLiter, Molarity.inCentimolesPerLiter],
    [Molarity.millimolesPerLiter, Molarity.inMillimolesPerLiter],
    [Molarity.micromolesPerLiter, Molarity.inMicromolesPerLiter],
  ]);

  testAnchors(Molarity.inMolesPerCubicMeter, [
    [Molarity.molesPerLiter, 1000],
    [Molarity.decimolesPerLiter, 100],
    [Molarity.centimolesPerLiter, 10],
    [Molarity.millimolesPerLiter, 1],
    [Molarity.micromolesPerLiter, 1e-3],
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
