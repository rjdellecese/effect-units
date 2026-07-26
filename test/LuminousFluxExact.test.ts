import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as LuminousFluxExact from "../src/LuminousFluxExact.ts";

describe("LuminousFluxExact", () => {
  testExactRoundtrips([[LuminousFluxExact.lumens, LuminousFluxExact.inLumens]]);
});
