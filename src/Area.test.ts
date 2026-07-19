import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Area", () => {
  testRoundtrips([
    // Metric
    [Area.squareMeters, Area.inSquareMeters],
    [Area.squareMillimeters, Area.inSquareMillimeters],
    [Area.squareCentimeters, Area.inSquareCentimeters],
    [Area.hectares, Area.inHectares],
    [Area.squareKilometers, Area.inSquareKilometers],

    // Imperial
    [Area.squareInches, Area.inSquareInches],
    [Area.squareFeet, Area.inSquareFeet],
    [Area.squareYards, Area.inSquareYards],
    [Area.acres, Area.inAcres],
    [Area.squareMiles, Area.inSquareMiles],
  ]);

  testAnchors(Area.inSquareMeters, [
    [Area.squareMillimeters, 1e-6],
    [Area.squareCentimeters, 1e-4],
    [Area.hectares, 1e4],
    [Area.squareKilometers, 1e6],
    [Area.squareInches, 6.4516e-4],
    [Area.squareFeet, 0.09290304],
    [Area.squareYards, 0.83612736],
    [Area.acres, 4046.8564224],
    [Area.squareMiles, 2589988.110336],
  ]);

  it("is the product of two lengths", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Length.meters(3), Length.meters(4)),
        Area.squareMeters(12),
      ),
    );
  });

  it("is the square of a length", () => {
    assertTrue(
      isQuantityCloseTo(Quantity.squared(Length.feet(1)), Area.squareFeet(1)),
    );
  });

  it("relates acres to square yards", () => {
    assertTrue(isCloseTo(Area.inSquareYards(Area.acres(1)), 4840));
  });
});
