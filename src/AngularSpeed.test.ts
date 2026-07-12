import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Angle from "./Angle";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Quantity from "./Quantity";

describe("AngularSpeed", () => {
  const roundtrip = [
    {
      there: AngularSpeed.radiansPerSecond,
      back: AngularSpeed.inRadiansPerSecond,
    },
    {
      there: AngularSpeed.degreesPerSecond,
      back: AngularSpeed.inDegreesPerSecond,
    },
    { there: AngularSpeed.turnsPerSecond, back: AngularSpeed.inTurnsPerSecond },
    { there: AngularSpeed.turnsPerMinute, back: AngularSpeed.inTurnsPerMinute },
    {
      there: AngularSpeed.revolutionsPerSecond,
      back: AngularSpeed.inRevolutionsPerSecond,
    },
    {
      there: AngularSpeed.revolutionsPerMinute,
      back: AngularSpeed.inRevolutionsPerMinute,
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

  it("is an angle per a duration", () => {
    assertTrue(
      quantityCloseTo(
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
