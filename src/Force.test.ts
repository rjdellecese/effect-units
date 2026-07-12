import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Acceleration from "./Acceleration";
import * as Force from "./Force";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";

describe("Force", () => {
  const roundtrip = [
    { there: Force.newtons, back: Force.inNewtons },
    { there: Force.kilonewtons, back: Force.inKilonewtons },
    { there: Force.meganewtons, back: Force.inMeganewtons },
    { there: Force.pounds, back: Force.inPounds },
    { there: Force.kips, back: Force.inKips },
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

  it("is a mass times an acceleration", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Mass.kilograms(BigDecimal.fromBigInt(1n)),
          Acceleration.metersPerSecondSquared(BigDecimal.fromBigInt(1n)),
        ),
        Force.newtons(BigDecimal.fromBigInt(1n)),
      ),
    );
  });

  it("relates pounds of force to mass under standard gravity", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Mass.pounds(BigDecimal.fromBigInt(1n)),
          Acceleration.gees(BigDecimal.fromBigInt(1n)),
        ),
        Force.pounds(BigDecimal.fromBigInt(1n)),
      ),
    );
  });
});
