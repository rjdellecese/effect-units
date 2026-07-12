import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as AngularAcceleration from "./AngularAcceleration";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Quantity from "./Quantity";

describe("AngularAcceleration", () => {
  const roundtrip = [
    {
      there: AngularAcceleration.radiansPerSecondSquared,
      back: AngularAcceleration.inRadiansPerSecondSquared,
    },
    {
      there: AngularAcceleration.degreesPerSecondSquared,
      back: AngularAcceleration.inDegreesPerSecondSquared,
    },
    {
      there: AngularAcceleration.turnsPerSecondSquared,
      back: AngularAcceleration.inTurnsPerSecondSquared,
    },
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

  it("is an angular speed per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(AngularSpeed.radiansPerSecond(10), Duration.seconds(2)),
        AngularAcceleration.radiansPerSecondSquared(5),
      ),
    );
  });
});
