import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";

describe("Speed", () => {
  const roundtrip = [
    { there: Speed.metersPerSecond, back: Speed.inMetersPerSecond },
    { there: Speed.kilometersPerHour, back: Speed.inKilometersPerHour },
    { there: Speed.feetPerSecond, back: Speed.inFeetPerSecond },
    { there: Speed.milesPerHour, back: Speed.inMilesPerHour },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("is a length per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Length.meters(10), Duration.seconds(2)),
        Speed.metersPerSecond(5),
      ),
    );
  });

  it("travels a length over a duration", () => {
    assertTrue(
      quantityCloseTo(
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

    assertTrue(closeTo(Length.inKilometers(distance), 180));
  });

  it("relates miles per hour to meters per second", () => {
    assertTrue(closeTo(Speed.inMetersPerSecond(Speed.milesPerHour(1)), 0.44704));
  });
});
