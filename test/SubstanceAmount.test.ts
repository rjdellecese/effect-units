import { describe } from "@effect/vitest";

import { testAnchors, testRoundtrips } from "./testUtils.ts";
import * as SubstanceAmount from "../src/SubstanceAmount.ts";

describe("SubstanceAmount", () => {
  testRoundtrips([
    [SubstanceAmount.moles, SubstanceAmount.inMoles],
    [SubstanceAmount.picomoles, SubstanceAmount.inPicomoles],
    [SubstanceAmount.nanomoles, SubstanceAmount.inNanomoles],
    [SubstanceAmount.micromoles, SubstanceAmount.inMicromoles],
    [SubstanceAmount.millimoles, SubstanceAmount.inMillimoles],
    [SubstanceAmount.centimoles, SubstanceAmount.inCentimoles],
    [SubstanceAmount.decimoles, SubstanceAmount.inDecimoles],
    [SubstanceAmount.kilomoles, SubstanceAmount.inKilomoles],
    [SubstanceAmount.megamoles, SubstanceAmount.inMegamoles],
    [SubstanceAmount.gigamoles, SubstanceAmount.inGigamoles],
  ]);

  testAnchors(SubstanceAmount.inMoles, [
    [SubstanceAmount.picomoles, 1e-12],
    [SubstanceAmount.nanomoles, 1e-9],
    [SubstanceAmount.micromoles, 1e-6],
    [SubstanceAmount.millimoles, 1e-3],
    [SubstanceAmount.centimoles, 1e-2],
    [SubstanceAmount.decimoles, 1e-1],
    [SubstanceAmount.kilomoles, 1e3],
    [SubstanceAmount.megamoles, 1e6],
    [SubstanceAmount.gigamoles, 1e9],
  ]);
});
