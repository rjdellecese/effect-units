import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Area from "../src/Area.ts";
import * as AreaExact from "../src/AreaExact.ts";
import * as Rational from "../src/Rational.ts";

describe("AreaExact", () => {
  testExactRoundtrips([
    [AreaExact.squareMeters, AreaExact.inSquareMeters],
    [AreaExact.squareMillimeters, AreaExact.inSquareMillimeters],
    [AreaExact.squareCentimeters, AreaExact.inSquareCentimeters],
    [AreaExact.hectares, AreaExact.inHectares],
    [AreaExact.squareKilometers, AreaExact.inSquareKilometers],
    [AreaExact.squareInches, AreaExact.inSquareInches],
    [AreaExact.squareFeet, AreaExact.inSquareFeet],
    [AreaExact.squareYards, AreaExact.inSquareYards],
    [AreaExact.acres, AreaExact.inAcres],
    [AreaExact.squareMiles, AreaExact.inSquareMiles],
  ]);

  testExactAnchors(AreaExact.inSquareMeters, [
    [AreaExact.squareMillimeters, Rational.unsafeMake(1n, 10n ** 6n)],
    [AreaExact.squareCentimeters, Rational.unsafeMake(1n, 10n ** 4n)],
    [AreaExact.hectares, Rational.unsafeMake(10n ** 4n)],
    [AreaExact.squareKilometers, Rational.unsafeMake(10n ** 6n)],
    [AreaExact.squareInches, Rational.unsafeMake(16129n, 25000000n)],
    [AreaExact.squareFeet, Rational.unsafeMake(145161n, 1562500n)],
    [AreaExact.squareYards, Rational.unsafeMake(1306449n, 1562500n)],
    [
      AreaExact.acres,
      Rational.multiply(
        Rational.unsafeMake(4840n),
        Rational.multiply(
          Rational.unsafeMake(1143n, 1250n),
          Rational.unsafeMake(1143n, 1250n),
        ),
      ),
    ],
    [
      AreaExact.squareMiles,
      Rational.multiply(
        Rational.unsafeMake(201168n, 125n),
        Rational.unsafeMake(201168n, 125n),
      ),
    ],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        AreaExact.inSquareInches(AreaExact.squareFeet(Rational.one)),
        Rational.unsafeMake(144n),
      ),
    );
    assertTrue(
      Equal.equals(
        AreaExact.inSquareYards(AreaExact.acres(Rational.one)),
        Rational.unsafeMake(4840n),
      ),
    );
    assertTrue(
      Equal.equals(
        AreaExact.inAcres(AreaExact.squareMiles(Rational.one)),
        Rational.unsafeMake(640n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [AreaExact.squareMillimeters, Area.squareMillimeters],
      [AreaExact.squareCentimeters, Area.squareCentimeters],
      [AreaExact.hectares, Area.hectares],
      [AreaExact.squareKilometers, Area.squareKilometers],
      [AreaExact.squareInches, Area.squareInches],
      [AreaExact.squareFeet, Area.squareFeet],
      [AreaExact.squareYards, Area.squareYards],
      [AreaExact.acres, Area.acres],
      [AreaExact.squareMiles, Area.squareMiles],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
