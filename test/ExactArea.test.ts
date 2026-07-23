import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Area from "../src/Area.ts";
import * as ExactArea from "../src/ExactArea.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactArea", () => {
  testExactRoundtrips([
    [ExactArea.squareMeters, ExactArea.inSquareMeters],
    [ExactArea.squareMillimeters, ExactArea.inSquareMillimeters],
    [ExactArea.squareCentimeters, ExactArea.inSquareCentimeters],
    [ExactArea.hectares, ExactArea.inHectares],
    [ExactArea.squareKilometers, ExactArea.inSquareKilometers],
    [ExactArea.squareInches, ExactArea.inSquareInches],
    [ExactArea.squareFeet, ExactArea.inSquareFeet],
    [ExactArea.squareYards, ExactArea.inSquareYards],
    [ExactArea.acres, ExactArea.inAcres],
    [ExactArea.squareMiles, ExactArea.inSquareMiles],
  ]);

  testExactAnchors(ExactArea.inSquareMeters, [
    [ExactArea.squareMillimeters, Rational.make(1n, 10n ** 6n)],
    [ExactArea.squareCentimeters, Rational.make(1n, 10n ** 4n)],
    [ExactArea.hectares, Rational.make(10n ** 4n)],
    [ExactArea.squareKilometers, Rational.make(10n ** 6n)],
    [ExactArea.squareInches, Rational.make(16129n, 25000000n)],
    [ExactArea.squareFeet, Rational.make(145161n, 1562500n)],
    [ExactArea.squareYards, Rational.make(1306449n, 1562500n)],
    [
      ExactArea.acres,
      Rational.multiply(
        Rational.make(4840n),
        Rational.multiply(
          Rational.make(1143n, 1250n),
          Rational.make(1143n, 1250n),
        ),
      ),
    ],
    [
      ExactArea.squareMiles,
      Rational.multiply(
        Rational.make(201168n, 125n),
        Rational.make(201168n, 125n),
      ),
    ],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactArea.inSquareInches(ExactArea.squareFeet(Rational.one)),
        Rational.make(144n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactArea.inSquareYards(ExactArea.acres(Rational.one)),
        Rational.make(4840n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactArea.inAcres(ExactArea.squareMiles(Rational.one)),
        Rational.make(640n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactArea.squareMillimeters, Area.squareMillimeters],
      [ExactArea.squareCentimeters, Area.squareCentimeters],
      [ExactArea.hectares, Area.hectares],
      [ExactArea.squareKilometers, Area.squareKilometers],
      [ExactArea.squareInches, Area.squareInches],
      [ExactArea.squareFeet, Area.squareFeet],
      [ExactArea.squareYards, Area.squareYards],
      [ExactArea.acres, Area.acres],
      [ExactArea.squareMiles, Area.squareMiles],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
