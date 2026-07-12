import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import { closeTo, double } from "./internal/testUtils";
import * as SubstanceAmount from "./SubstanceAmount";

describe("SubstanceAmount", () => {
  const roundtrip = [
    { there: SubstanceAmount.moles, back: SubstanceAmount.inMoles },
    { there: SubstanceAmount.picomoles, back: SubstanceAmount.inPicomoles },
    { there: SubstanceAmount.nanomoles, back: SubstanceAmount.inNanomoles },
    { there: SubstanceAmount.micromoles, back: SubstanceAmount.inMicromoles },
    { there: SubstanceAmount.millimoles, back: SubstanceAmount.inMillimoles },
    { there: SubstanceAmount.centimoles, back: SubstanceAmount.inCentimoles },
    { there: SubstanceAmount.decimoles, back: SubstanceAmount.inDecimoles },
    { there: SubstanceAmount.kilomoles, back: SubstanceAmount.inKilomoles },
    { there: SubstanceAmount.megamoles, back: SubstanceAmount.inMegamoles },
    { there: SubstanceAmount.gigamoles, back: SubstanceAmount.inGigamoles },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });
});
