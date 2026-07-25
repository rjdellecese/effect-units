import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactVoltage from "../src/ExactVoltage.ts";

describe("ExactVoltage", () => {
  testExactRoundtrips([[ExactVoltage.volts, ExactVoltage.inVolts]]);
});
