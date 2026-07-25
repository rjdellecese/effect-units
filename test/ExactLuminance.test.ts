import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactLuminance from "../src/ExactLuminance.ts";

describe("ExactLuminance", () => {
  testExactRoundtrips([[ExactLuminance.nits, ExactLuminance.inNits]]);
});
