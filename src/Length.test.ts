import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Length from "./Length";

describe("Length", () => {
  const roundtrip = [
    // Metric
    { there: Length.meters, back: Length.inMeters },
    { there: Length.kilometers, back: Length.inKilometers },
    { there: Length.centimeters, back: Length.inCentimeters },
    { there: Length.millimeters, back: Length.inMillimeters },

    // Imperial
    { there: Length.inches, back: Length.inInches },
    { there: Length.feet, back: Length.inFeet },
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
