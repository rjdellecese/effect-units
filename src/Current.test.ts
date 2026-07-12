import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Charge from "./Charge";
import * as Current from "./Current";
import * as Duration from "./Duration";
import * as Quantity from "./Quantity";

describe("Current", () => {
  const roundtrip = [
    { there: Current.amperes, back: Current.inAmperes },
    { there: Current.milliamperes, back: Current.inMilliamperes },
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

  it("is a charge per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Charge.coulombs(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Current.amperes(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("accumulates ampere hours over an hour", () => {
    assertTrue(
      Equal.equals(
        Quantity.at(
          Current.amperes(BigDecimal.fromBigInt(1n)),
          Duration.hours(BigDecimal.fromBigInt(1n)),
        ),
        Charge.ampereHours(BigDecimal.fromBigInt(1n)),
      ),
    );
  });
});
