import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as LuminousIntensityExact from "../src/LuminousIntensityExact.ts";

describe("LuminousIntensityExact", () => {
  testExactRoundtrips([
    [LuminousIntensityExact.candelas, LuminousIntensityExact.inCandelas],
  ]);
});
