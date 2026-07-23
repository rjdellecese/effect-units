import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactResistance from "../src/ExactResistance.ts";

describe("ExactResistance", () => {
  testExactRoundtrips([[ExactResistance.ohms, ExactResistance.inOhms]]);
});
