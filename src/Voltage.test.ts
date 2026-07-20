import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Current from "./Current.ts";
import { isQuantityCloseTo, testRoundtrip } from "../test/testUtils.ts";
import * as Power from "./Power.ts";
import * as Quantity from "./Quantity.ts";
import * as Voltage from "./Voltage.ts";

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
