import { describe } from "@effect/vitest";

import { testRoundtrips } from "./internal/testUtils";
import * as SubstanceAmount from "./SubstanceAmount";

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
});
