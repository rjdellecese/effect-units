import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Force from "../src/Force.ts";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Torque from "../src/Torque.ts";

describe("Torque", () => {
  testRoundtrips([
    [Torque.newtonMeters, Torque.inNewtonMeters],
    [Torque.poundFeet, Torque.inPoundFeet],
  ]);

  testAnchors(Torque.inNewtonMeters, [[Torque.poundFeet, 1.3558179483314003]]);

  it("is a force times a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Force.pounds(1), Length.feet(1)),
        Torque.poundFeet(1),
      ),
    );
  });
});
