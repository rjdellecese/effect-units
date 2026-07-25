import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactLuminousIntensity from "../src/ExactLuminousIntensity.ts";

describe("ExactLuminousIntensity", () => {
  testExactRoundtrips([
    [ExactLuminousIntensity.candelas, ExactLuminousIntensity.inCandelas],
  ]);
});
