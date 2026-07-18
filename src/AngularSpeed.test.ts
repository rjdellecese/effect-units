import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";

import * as Angle from "./Angle";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import {
  double,
  isQuantityCloseTo,
  testRoundtrips,
} from "./internal/testUtils";
import * as Quantity from "./Quantity";

describe("AngularSpeed", () => {
  testRoundtrips([
    [AngularSpeed.radiansPerSecond, AngularSpeed.inRadiansPerSecond],
    [AngularSpeed.degreesPerSecond, AngularSpeed.inDegreesPerSecond],
    [AngularSpeed.turnsPerSecond, AngularSpeed.inTurnsPerSecond],
    [AngularSpeed.turnsPerMinute, AngularSpeed.inTurnsPerMinute],
    [AngularSpeed.revolutionsPerSecond, AngularSpeed.inRevolutionsPerSecond],
    [AngularSpeed.revolutionsPerMinute, AngularSpeed.inRevolutionsPerMinute],
  ]);

  it("is an angle per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Angle.radians(10), Duration.seconds(2)),
        AngularSpeed.radiansPerSecond(5),
      ),
    );
  });

  it("treats revolutions as turns", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        assertTrue(
          Equal.equals(
            AngularSpeed.revolutionsPerSecond(n),
            AngularSpeed.turnsPerSecond(n),
          ),
        );
      }),
    );
  });
});
