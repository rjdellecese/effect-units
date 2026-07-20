import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration.ts";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.ts";
import * as Length from "./Length.ts";
import * as Quantity from "./Quantity.ts";
import * as Speed from "./Speed.ts";

describe("Speed", () => {
  testRoundtrips([
    [Speed.metersPerSecond, Speed.inMetersPerSecond],
    [Speed.kilometersPerHour, Speed.inKilometersPerHour],
    [Speed.feetPerSecond, Speed.inFeetPerSecond],
    [Speed.milesPerHour, Speed.inMilesPerHour],
  ]);

  testAnchors(Speed.inMetersPerSecond, [
    [Speed.kilometersPerHour, 1000 / 3600],
    [Speed.feetPerSecond, 0.3048],
    [Speed.milesPerHour, 0.44704],
  ]);

  it("is a length per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Length.meters(10), Duration.seconds(2)),
        Speed.metersPerSecond(5),
      ),
    );
  });

  it("travels a length over a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.at(Speed.metersPerSecond(5), Duration.seconds(2)),
        Length.meters(10),
      ),
    );
  });

  it("relates kilometers per hour to kilometers and hours", () => {
    const distance = Quantity.at(
      Speed.kilometersPerHour(90),
      Duration.hours(2),
    );

    assertTrue(isCloseTo(Length.inKilometers(distance), 180));
  });

  it("relates miles per hour to meters per second", () => {
    assertTrue(
      isCloseTo(Speed.inMetersPerSecond(Speed.milesPerHour(1)), 0.44704),
    );
  });
});
