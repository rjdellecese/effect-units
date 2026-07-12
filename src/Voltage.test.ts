import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Current from "./Current";
import * as Power from "./Power";
import * as Quantity from "./Quantity";
import * as Voltage from "./Voltage";

describe("Voltage", () => {
  it("roundtrips between 'volts' and 'inVolts'", () => {
    FastCheck.assert(
      FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
        const roundTripped = pipe(n, Voltage.volts, Voltage.inVolts);

        return assertEquals(roundTripped, n);
      }),
    );
  });

  it("is a power per a current", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Power.watts(BigDecimal.fromBigInt(10n)),
          Current.amperes(BigDecimal.fromBigInt(2n)),
        ),
        Voltage.volts(BigDecimal.fromBigInt(5n)),
      ),
    );
  });
});
