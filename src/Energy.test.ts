import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Energy from "./Energy";
import * as Force from "./Force";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Energy", () => {
  const roundtrip = [
    { there: Energy.joules, back: Energy.inJoules },
    { there: Energy.kilojoules, back: Energy.inKilojoules },
    { there: Energy.megajoules, back: Energy.inMegajoules },
    { there: Energy.kilowattHours, back: Energy.inKilowattHours },
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

  it("is a force times a length", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Force.newtons(BigDecimal.fromBigInt(3n)),
          Length.meters(BigDecimal.fromBigInt(4n)),
        ),
        Energy.joules(BigDecimal.fromBigInt(12n)),
      ),
    );
  });
});
