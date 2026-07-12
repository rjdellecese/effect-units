import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Current from "./Current";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Quantity from "./Quantity";
import * as Resistance from "./Resistance";
import * as Voltage from "./Voltage";

describe("Resistance", () => {
  it("roundtrips between 'ohms' and 'inOhms'", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        assertTrue(closeTo(pipe(n, Resistance.ohms, Resistance.inOhms), n));
      }),
    );
  });

  it("is a voltage per a current", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Voltage.volts(10), Current.amperes(2)),
        Resistance.ohms(5),
      ),
    );
  });

  it("relates voltage to current through Ohm's law", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.at(Resistance.ohms(4), Current.amperes(3)),
        Voltage.volts(12),
      ),
    );
  });
});
