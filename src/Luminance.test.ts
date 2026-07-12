import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Area from "./Area";
import * as Luminance from "./Luminance";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";

describe("Luminance", () => {
  const roundtrip = [
    { there: Luminance.nits, back: Luminance.inNits },
    { there: Luminance.footLamberts, back: Luminance.inFootLamberts },
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

  it("is an intensity per an area", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          LuminousIntensity.candelas(BigDecimal.fromBigInt(10n)),
          Area.squareMeters(BigDecimal.fromBigInt(2n)),
        ),
        Luminance.nits(BigDecimal.fromBigInt(5n)),
      ),
    );
  });
});
