import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Acceleration from "./Acceleration.ts";
import * as Force from "./Force.ts";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.ts";
import * as Mass from "./Mass.ts";
import * as Quantity from "./Quantity.ts";

describe("Force", () => {
  testRoundtrips([
    [Force.newtons, Force.inNewtons],
    [Force.kilonewtons, Force.inKilonewtons],
    [Force.meganewtons, Force.inMeganewtons],
    [Force.pounds, Force.inPounds],
    [Force.kips, Force.inKips],
  ]);

  testAnchors(Force.inNewtons, [
    [Force.kilonewtons, 1e3],
    [Force.meganewtons, 1e6],
    [Force.pounds, 4.4482216152605],
    [Force.kips, 4448.2216152605],
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
