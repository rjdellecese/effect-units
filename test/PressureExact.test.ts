import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as ForceExact from "../src/ForceExact.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as PressureExact from "../src/PressureExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as Pressure from "../src/Pressure.ts";
import * as Rational from "../src/Rational.ts";

describe("PressureExact", () => {
  testExactRoundtrips([
    [PressureExact.pascals, PressureExact.inPascals],
    [PressureExact.kilopascals, PressureExact.inKilopascals],
    [PressureExact.megapascals, PressureExact.inMegapascals],
    [PressureExact.poundsPerSquareInch, PressureExact.inPoundsPerSquareInch],
    [PressureExact.atmospheres, PressureExact.inAtmospheres],
  ]);

  testExactAnchors(PressureExact.inPascals, [
    [PressureExact.kilopascals, Rational.unsafeMake(1000n)],
    [PressureExact.megapascals, Rational.unsafeMake(1000000n)],
    [
      PressureExact.poundsPerSquareInch,
      Rational.unsafeDivide(
        Rational.multiply(
          Rational.unsafeMake(45359237n, 100000000n),
          Rational.unsafeMake(196133n, 20000n),
        ),
        Rational.multiply(
          Rational.unsafeMake(127n, 5000n),
          Rational.unsafeMake(127n, 5000n),
        ),
      ),
    ],
    [PressureExact.atmospheres, Rational.unsafeMake(101325n)],
  ]);

  it("is an exact pound of force per exact square inch", () => {
    const rate = QuantityExact.per(
      ForceExact.pounds(Rational.one),
      QuantityExact.squared(LengthExact.inches(Rational.one)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        PressureExact.inPoundsPerSquareInch(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [PressureExact.kilopascals, Pressure.kilopascals],
      [PressureExact.megapascals, Pressure.megapascals],
      [PressureExact.atmospheres, Pressure.atmospheres],
      [PressureExact.poundsPerSquareInch, Pressure.poundsPerSquareInch],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
