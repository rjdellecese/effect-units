import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrip,
} from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";

describe("Speed", () => {
  testRoundtrip(Speed.metersPerSecond, Speed.inMetersPerSecond);
  testRoundtrip(Speed.kilometersPerHour, Speed.inKilometersPerHour);
  testRoundtrip(Speed.feetPerSecond, Speed.inFeetPerSecond);
  testRoundtrip(Speed.milesPerHour, Speed.inMilesPerHour);

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
