import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Acceleration from "./Acceleration";
import * as Duration from "./Duration";
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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("is a speed per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Speed.metersPerSecond(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Acceleration.metersPerSecondSquared(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("accumulates speed over a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.at(
          Acceleration.metersPerSecondSquared(BigDecimal.fromBigInt(3n)),
          Duration.seconds(BigDecimal.fromBigInt(4n)),
        ),
        Speed.metersPerSecond(BigDecimal.fromBigInt(12n)),
      ),
    );
  });
});
