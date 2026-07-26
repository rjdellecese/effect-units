import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as LuminanceExact from "../src/LuminanceExact.ts";

describe("LuminanceExact", () => {
  testExactRoundtrips([[LuminanceExact.nits, LuminanceExact.inNits]]);
});
