import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as ResistanceExact from "../src/ResistanceExact.ts";

describe("ResistanceExact", () => {
  testExactRoundtrips([[ResistanceExact.ohms, ResistanceExact.inOhms]]);
});
