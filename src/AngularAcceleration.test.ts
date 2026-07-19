import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as AngularAcceleration from "./AngularAcceleration";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "./internal/testUtils";
import * as Quantity from "./Quantity";

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
