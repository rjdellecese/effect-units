import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Force from "./Force";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Torque from "./Torque";

describe("Torque", () => {
  const roundtrip = [
    { there: Torque.newtonMeters, back: Torque.inNewtonMeters },
    { there: Torque.poundFeet, back: Torque.inPoundFeet },
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
          Force.pounds(BigDecimal.fromBigInt(1n)),
          Length.feet(BigDecimal.fromBigInt(1n)),
        ),
        Torque.poundFeet(BigDecimal.fromBigInt(1n)),
      ),
    );
  });
});
