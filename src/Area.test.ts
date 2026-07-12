import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Area from "./Area";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
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
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("is the product of two lengths", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(Length.meters(3), Length.meters(4)),
        Area.squareMeters(12),
      ),
    );
  });

  it("is the square of a length", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.squared(Length.feet(1)),
        Area.squareFeet(1),
      ),
    );
  });

  it("relates acres to square yards", () => {
    assertTrue(closeTo(Area.inSquareYards(Area.acres(1)), 4840));
  });
});
