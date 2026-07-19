import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Force from "./Force.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Length from "./Length.js";
import * as Quantity from "./Quantity.js";
import * as Torque from "./Torque.js";

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
