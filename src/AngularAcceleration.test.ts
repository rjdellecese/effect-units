import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as AngularAcceleration from "./AngularAcceleration.js";
import * as AngularSpeed from "./AngularSpeed.js";
import * as Duration from "./Duration.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Quantity from "./Quantity.js";

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
