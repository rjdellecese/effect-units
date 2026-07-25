import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactLuminousFlux from "../src/ExactLuminousFlux.ts";

describe("ExactLuminousFlux", () => {
  testExactRoundtrips([[ExactLuminousFlux.lumens, ExactLuminousFlux.inLumens]]);
});
