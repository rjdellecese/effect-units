import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Current from "./Current.js";
import { isQuantityCloseTo, testRoundtrip } from "../test/testUtils.js";
import * as Power from "./Power.js";
import * as Quantity from "./Quantity.js";
import * as Voltage from "./Voltage.js";

describe("Voltage", () => {
  testRoundtrip(Voltage.volts, Voltage.inVolts);

  it("is a power per a current", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Power.watts(10), Current.amperes(2)),
        Voltage.volts(5),
      ),
    );
  });
});
