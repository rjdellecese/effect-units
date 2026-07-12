import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Area from "./Area";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Area", () => {
  const roundtrip = [
    // Metric
    { there: Area.squareMeters, back: Area.inSquareMeters },
    { there: Area.squareMillimeters, back: Area.inSquareMillimeters },
    { there: Area.squareCentimeters, back: Area.inSquareCentimeters },
    { there: Area.hectares, back: Area.inHectares },
    { there: Area.squareKilometers, back: Area.inSquareKilometers },

    // Imperial
    { there: Area.squareInches, back: Area.inSquareInches },
    { there: Area.squareFeet, back: Area.inSquareFeet },
    { there: Area.squareYards, back: Area.inSquareYards },
    { there: Area.acres, back: Area.inAcres },
    { there: Area.squareMiles, back: Area.inSquareMiles },
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

  it("is the product of two lengths", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Length.meters(BigDecimal.fromBigInt(3n)),
          Length.meters(BigDecimal.fromBigInt(4n)),
        ),
        Area.squareMeters(BigDecimal.fromBigInt(12n)),
      ),
    );
  });

  it("is the square of a length", () => {
    assertTrue(
      Equal.equals(
        Quantity.squared(Length.feet(BigDecimal.fromBigInt(1n))),
        Area.squareFeet(BigDecimal.fromBigInt(1n)),
      ),
    );
  });

  it("relates acres to square yards exactly", () => {
    assertEquals(
      Area.inSquareYards(Area.acres(BigDecimal.fromBigInt(1n))),
      BigDecimal.normalize(BigDecimal.fromBigInt(4840n)),
    );
  });
});
