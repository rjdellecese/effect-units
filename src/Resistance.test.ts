import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Current from "./Current.js";
import { isQuantityCloseTo, testRoundtrip } from "../test/testUtils.js";
import * as Quantity from "./Quantity.js";
import * as Resistance from "./Resistance.js";
import * as Voltage from "./Voltage.js";

describe("Resistance", () => {
  testRoundtrip(Resistance.ohms, Resistance.inOhms);

  it("is a voltage per a current", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Voltage.volts(10), Current.amperes(2)),
        Resistance.ohms(5),
      ),
    );
  });

  it("relates voltage to current through Ohm's law", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.at(Resistance.ohms(4), Current.amperes(3)),
        Voltage.volts(12),
      ),
    );
  });
});
