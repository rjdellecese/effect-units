import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";

import * as Angle from "./Angle.ts";
import * as AngularSpeed from "./AngularSpeed.ts";
import * as Duration from "./Duration.ts";
import {
  double,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.ts";
import * as Quantity from "./Quantity.ts";

describe("AngularSpeed", () => {
  testRoundtrips([
    [AngularSpeed.radiansPerSecond, AngularSpeed.inRadiansPerSecond],
    [AngularSpeed.degreesPerSecond, AngularSpeed.inDegreesPerSecond],
    [AngularSpeed.turnsPerSecond, AngularSpeed.inTurnsPerSecond],
    [AngularSpeed.turnsPerMinute, AngularSpeed.inTurnsPerMinute],
    [AngularSpeed.revolutionsPerSecond, AngularSpeed.inRevolutionsPerSecond],
    [AngularSpeed.revolutionsPerMinute, AngularSpeed.inRevolutionsPerMinute],
  ]);

  testAnchors(AngularSpeed.inRadiansPerSecond, [
    [AngularSpeed.degreesPerSecond, Math.PI / 180],
    [AngularSpeed.turnsPerSecond, 2 * Math.PI],
    [AngularSpeed.turnsPerMinute, (2 * Math.PI) / 60],
    [AngularSpeed.revolutionsPerSecond, 2 * Math.PI],
    [AngularSpeed.revolutionsPerMinute, (2 * Math.PI) / 60],
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
