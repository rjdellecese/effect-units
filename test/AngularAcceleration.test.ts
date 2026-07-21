import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as AngularAcceleration from "../src/AngularAcceleration.ts";
import * as AngularSpeed from "../src/AngularSpeed.ts";
import * as Duration from "../src/Duration.ts";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as Quantity from "../src/Quantity.ts";

describe("AngularAcceleration", () => {
  testRoundtrips([
    [
      AngularAcceleration.radiansPerSecondSquared,
      AngularAcceleration.inRadiansPerSecondSquared,
    ],
    [
      AngularAcceleration.degreesPerSecondSquared,
      AngularAcceleration.inDegreesPerSecondSquared,
    ],
    [
      AngularAcceleration.turnsPerSecondSquared,
      AngularAcceleration.inTurnsPerSecondSquared,
    ],
  ]);

  testAnchors(AngularAcceleration.inRadiansPerSecondSquared, [
    [AngularAcceleration.degreesPerSecondSquared, Math.PI / 180],
    [AngularAcceleration.turnsPerSecondSquared, 2 * Math.PI],
  ]);

  it("is an angular speed per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(AngularSpeed.radiansPerSecond(10), Duration.seconds(2)),
        AngularAcceleration.radiansPerSecondSquared(5),
      ),
    );
  });
});
