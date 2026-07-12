import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Acceleration from "./Acceleration";
import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";

describe("Acceleration", () => {
  const roundtrip = [
    {
      there: Acceleration.metersPerSecondSquared,
      back: Acceleration.inMetersPerSecondSquared,
    },
    {
      there: Acceleration.feetPerSecondSquared,
      back: Acceleration.inFeetPerSecondSquared,
    },
    { there: Acceleration.gees, back: Acceleration.inGees },
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

  it("is a speed per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Speed.metersPerSecond(10), Duration.seconds(2)),
        Acceleration.metersPerSecondSquared(5),
      ),
    );
  });

  it("accumulates speed over a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.at(
          Acceleration.metersPerSecondSquared(3),
          Duration.seconds(4),
        ),
        Speed.metersPerSecond(12),
      ),
    );
  });
});
