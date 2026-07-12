import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Charge from "./Charge";
import { closeTo, double } from "./internal/testUtils";

describe("Charge", () => {
  const roundtrip = [
    { there: Charge.coulombs, back: Charge.inCoulombs },
    { there: Charge.ampereHours, back: Charge.inAmpereHours },
    { there: Charge.milliampereHours, back: Charge.inMilliampereHours },
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
