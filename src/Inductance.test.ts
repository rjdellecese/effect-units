import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Inductance from "./Inductance";

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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });
});
