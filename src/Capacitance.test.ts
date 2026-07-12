import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Capacitance from "./Capacitance";

describe("Capacitance", () => {
  const roundtrip = [
    { there: Capacitance.farads, back: Capacitance.inFarads },
    { there: Capacitance.picofarads, back: Capacitance.inPicofarads },
    { there: Capacitance.nanofarads, back: Capacitance.inNanofarads },
    { there: Capacitance.microfarads, back: Capacitance.inMicrofarads },
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
