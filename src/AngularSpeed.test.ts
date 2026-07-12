import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Angle from "./Angle";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("is an angle per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Angle.radians(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        AngularSpeed.radiansPerSecond(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("treats revolutions as turns", () => {
    FastCheck.assert(
      FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
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
