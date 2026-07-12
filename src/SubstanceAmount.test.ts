import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });
});
