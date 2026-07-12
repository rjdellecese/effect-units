import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Area from "./Area";
import * as Force from "./Force";
import * as Pressure from "./Pressure";
import * as Quantity from "./Quantity";

describe("Pressure", () => {
  const roundtrip = [
    { there: Pressure.pascals, back: Pressure.inPascals },
    { there: Pressure.kilopascals, back: Pressure.inKilopascals },
    { there: Pressure.megapascals, back: Pressure.inMegapascals },
    { there: Pressure.poundsPerSquareInch, back: Pressure.inPoundsPerSquareInch },
    { there: Pressure.atmospheres, back: Pressure.inAtmospheres },
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

  it("is a force per an area", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Force.newtons(BigDecimal.fromBigInt(10n)),
          Area.squareMeters(BigDecimal.fromBigInt(2n)),
        ),
        Pressure.pascals(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("relates atmospheres to pascals exactly", () => {
    assertEquals(
      Pressure.inPascals(Pressure.atmospheres(BigDecimal.fromBigInt(1n))),
      BigDecimal.normalize(BigDecimal.fromBigInt(101325n)),
    );
  });
});
