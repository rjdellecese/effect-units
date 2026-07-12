import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Inductance from "./Inductance";
import { closeTo, double } from "./internal/testUtils";

describe("Inductance", () => {
  const roundtrip = [
    { there: Inductance.henries, back: Inductance.inHenries },
    { there: Inductance.nanohenries, back: Inductance.inNanohenries },
    { there: Inductance.microhenries, back: Inductance.inMicrohenries },
    { there: Inductance.millihenries, back: Inductance.inMillihenries },
    { there: Inductance.kilohenries, back: Inductance.inKilohenries },
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
