import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as LuminousFlux from "./LuminousFlux";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";
import * as SolidAngle from "./SolidAngle";

describe("LuminousFlux and LuminousIntensity", () => {
  const roundtrip = [
    { there: LuminousFlux.lumens, back: LuminousFlux.inLumens },
    { there: LuminousIntensity.candelas, back: LuminousIntensity.inCandelas },
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

  it("luminous intensity is a flux per a solid angle", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          LuminousFlux.lumens(BigDecimal.fromBigInt(10n)),
          SolidAngle.steradians(BigDecimal.fromBigInt(2n)),
        ),
        LuminousIntensity.candelas(BigDecimal.fromBigInt(5n)),
      ),
    );
  });
});
