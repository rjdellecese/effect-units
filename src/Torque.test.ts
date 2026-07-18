import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Force from "./Force";
import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Torque from "./Torque";

describe("Torque", () => {
  testRoundtrips([
    [Torque.newtonMeters, Torque.inNewtonMeters],
    [Torque.poundFeet, Torque.inPoundFeet],
  ]);

  it("is a force times a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Force.pounds(1), Length.feet(1)),
        Torque.poundFeet(1),
      ),
    );
  });
});
