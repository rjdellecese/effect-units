import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as VoltageExact from "../src/VoltageExact.ts";

describe("VoltageExact", () => {
  testExactRoundtrips([[VoltageExact.volts, VoltageExact.inVolts]]);
});
