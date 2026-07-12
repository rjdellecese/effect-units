import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Current from "./Current";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Power from "./Power";
import * as Quantity from "./Quantity";
import * as Voltage from "./Voltage";

describe("Voltage", () => {
  it("roundtrips between 'volts' and 'inVolts'", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        assertTrue(closeTo(pipe(n, Voltage.volts, Voltage.inVolts), n));
      }),
    );
  });

  it("is a power per a current", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Power.watts(10), Current.amperes(2)),
        Voltage.volts(5),
      ),
    );
  });
});
