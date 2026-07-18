import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Acceleration from "./Acceleration";
import * as Force from "./Force";
import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";

describe("Force", () => {
  testRoundtrips([
    [Force.newtons, Force.inNewtons],
    [Force.kilonewtons, Force.inKilonewtons],
    [Force.meganewtons, Force.inMeganewtons],
    [Force.pounds, Force.inPounds],
    [Force.kips, Force.inKips],
  ]);

  it("is a mass times an acceleration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(
          Mass.kilograms(1),
          Acceleration.metersPerSecondSquared(1),
        ),
        Force.newtons(1),
      ),
    );
  });

  it("relates pounds of force to mass under standard gravity", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Mass.pounds(1), Acceleration.gees(1)),
        Force.pounds(1),
      ),
    );
  });
});
