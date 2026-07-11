import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Mass from "./Mass";

describe("Mass", () => {
  const roundtrip = [
    // Metric
    { there: Mass.kilograms, back: Mass.inKilograms },
    { there: Mass.grams, back: Mass.inGrams },
    { there: Mass.milligrams, back: Mass.inMilligrams },
    { there: Mass.micrograms, back: Mass.inMicrograms },
    { there: Mass.nanograms, back: Mass.inNanograms },

    // Imperial
    { there: Mass.ounces, back: Mass.inOunces },
    { there: Mass.pounds, back: Mass.inPounds },
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
