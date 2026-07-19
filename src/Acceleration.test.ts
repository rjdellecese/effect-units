import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Acceleration from "./Acceleration.js";
import * as Duration from "./Duration.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Quantity from "./Quantity.js";
import * as Speed from "./Speed.js";

describe("Acceleration", () => {
  testRoundtrips([
    [
      Acceleration.metersPerSecondSquared,
      Acceleration.inMetersPerSecondSquared,
    ],
    [Acceleration.feetPerSecondSquared, Acceleration.inFeetPerSecondSquared],
    [Acceleration.gees, Acceleration.inGees],
  ]);

  testAnchors(Acceleration.inMetersPerSecondSquared, [
    [Acceleration.feetPerSecondSquared, 0.3048],
    [Acceleration.gees, 9.80665],
  ]);

  it("is a speed per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Speed.metersPerSecond(10), Duration.seconds(2)),
        Acceleration.metersPerSecondSquared(5),
      ),
    );
  });

  it("accumulates speed over a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.at(
          Acceleration.metersPerSecondSquared(3),
          Duration.seconds(4),
        ),
        Speed.metersPerSecond(12),
      ),
    );
  });
});
