import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as AngularAcceleration from "./AngularAcceleration";
import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("is an angular speed per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          AngularSpeed.radiansPerSecond(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        AngularAcceleration.radiansPerSecondSquared(BigDecimal.fromBigInt(5n)),
      ),
    );
  });
});
