import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrip,
} from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Area", () => {
  // Metric
  testRoundtrip(Area.squareMeters, Area.inSquareMeters);
  testRoundtrip(Area.squareMillimeters, Area.inSquareMillimeters);
  testRoundtrip(Area.squareCentimeters, Area.inSquareCentimeters);
  testRoundtrip(Area.hectares, Area.inHectares);
  testRoundtrip(Area.squareKilometers, Area.inSquareKilometers);

  // Imperial
  testRoundtrip(Area.squareInches, Area.inSquareInches);
  testRoundtrip(Area.squareFeet, Area.inSquareFeet);
  testRoundtrip(Area.squareYards, Area.inSquareYards);
  testRoundtrip(Area.acres, Area.inAcres);
  testRoundtrip(Area.squareMiles, Area.inSquareMiles);

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
