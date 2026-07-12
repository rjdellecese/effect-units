import { describe } from "@effect/vitest";

import { testRoundtrip } from "./internal/testUtils";
import * as SubstanceAmount from "./SubstanceAmount";

describe("SubstanceAmount", () => {
  testRoundtrip(SubstanceAmount.moles, SubstanceAmount.inMoles);
  testRoundtrip(SubstanceAmount.picomoles, SubstanceAmount.inPicomoles);
  testRoundtrip(SubstanceAmount.nanomoles, SubstanceAmount.inNanomoles);
  testRoundtrip(SubstanceAmount.micromoles, SubstanceAmount.inMicromoles);
  testRoundtrip(SubstanceAmount.millimoles, SubstanceAmount.inMillimoles);
  testRoundtrip(SubstanceAmount.centimoles, SubstanceAmount.inCentimoles);
  testRoundtrip(SubstanceAmount.decimoles, SubstanceAmount.inDecimoles);
  testRoundtrip(SubstanceAmount.kilomoles, SubstanceAmount.inKilomoles);
  testRoundtrip(SubstanceAmount.megamoles, SubstanceAmount.inMegamoles);
  testRoundtrip(SubstanceAmount.gigamoles, SubstanceAmount.inGigamoles);
});
