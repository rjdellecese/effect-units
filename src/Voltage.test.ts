import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Current from "./Current";
import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Power from "./Power";
import * as Quantity from "./Quantity";
import * as Voltage from "./Voltage";

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
