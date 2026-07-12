import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Current from "./Current";
import * as Quantity from "./Quantity";
import * as Resistance from "./Resistance";
import * as Voltage from "./Voltage";

describe("Resistance", () => {
  it("roundtrips between 'ohms' and 'inOhms'", () => {
    FastCheck.assert(
      FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
        const roundTripped = pipe(n, Resistance.ohms, Resistance.inOhms);

        return assertEquals(roundTripped, n);
      }),
    );
  });

  it("is a voltage per a current", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Voltage.volts(BigDecimal.fromBigInt(10n)),
          Current.amperes(BigDecimal.fromBigInt(2n)),
        ),
        Resistance.ohms(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("relates voltage to current through Ohm's law", () => {
    assertTrue(
      Equal.equals(
        Quantity.at(
          Resistance.ohms(BigDecimal.fromBigInt(4n)),
          Current.amperes(BigDecimal.fromBigInt(3n)),
        ),
        Voltage.volts(BigDecimal.fromBigInt(12n)),
      ),
    );
  });
});
