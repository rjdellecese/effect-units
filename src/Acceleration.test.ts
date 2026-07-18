import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Acceleration from "./Acceleration";
import * as Duration from "./Duration";
import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";

describe("Acceleration", () => {
  testRoundtrips([
    [Acceleration.metersPerSecondSquared, Acceleration.inMetersPerSecondSquared],
    [Acceleration.feetPerSecondSquared, Acceleration.inFeetPerSecondSquared],
    [Acceleration.gees, Acceleration.inGees],
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
