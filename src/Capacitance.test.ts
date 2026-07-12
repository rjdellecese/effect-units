import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Capacitance from "./Capacitance";
import { closeTo, double } from "./internal/testUtils";

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
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });
});
