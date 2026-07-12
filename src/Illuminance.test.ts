import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Area from "./Area";
import * as Illuminance from "./Illuminance";
import * as LuminousFlux from "./LuminousFlux";
import * as Quantity from "./Quantity";

describe("Illuminance", () => {
  const roundtrip = [
    { there: Illuminance.lux, back: Illuminance.inLux },
    { there: Illuminance.footCandles, back: Illuminance.inFootCandles },
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

  it("is a flux per an area", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          LuminousFlux.lumens(BigDecimal.fromBigInt(10n)),
          Area.squareMeters(BigDecimal.fromBigInt(2n)),
        ),
        Illuminance.lux(BigDecimal.fromBigInt(5n)),
      ),
    );
  });
});
