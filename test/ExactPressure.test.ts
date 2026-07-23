import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactForce from "../src/ExactForce.ts";
import * as ExactLength from "../src/ExactLength.ts";
import * as ExactPressure from "../src/ExactPressure.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
import * as Pressure from "../src/Pressure.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactPressure", () => {
  testExactRoundtrips([
    [ExactPressure.pascals, ExactPressure.inPascals],
    [ExactPressure.kilopascals, ExactPressure.inKilopascals],
    [ExactPressure.megapascals, ExactPressure.inMegapascals],
    [ExactPressure.poundsPerSquareInch, ExactPressure.inPoundsPerSquareInch],
    [ExactPressure.atmospheres, ExactPressure.inAtmospheres],
  ]);

  testExactAnchors(ExactPressure.inPascals, [
    [ExactPressure.kilopascals, Rational.make(1000n)],
    [ExactPressure.megapascals, Rational.make(1000000n)],
    [
      ExactPressure.poundsPerSquareInch,
      Rational.unsafeDivide(
        Rational.multiply(
          Rational.make(45359237n, 100000000n),
          Rational.make(196133n, 20000n),
        ),
        Rational.multiply(
          Rational.make(127n, 5000n),
          Rational.make(127n, 5000n),
        ),
      ),
    ],
    [ExactPressure.atmospheres, Rational.make(101325n)],
  ]);

  it("is an exact pound of force per exact square inch", () => {
    const rate = ExactQuantity.per(
      ExactForce.pounds(Rational.one),
      ExactQuantity.squared(ExactLength.inches(Rational.one)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        ExactPressure.inPoundsPerSquareInch(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    // No poundsPerSquareInch here: the float factor divides by a squared
    // inch factor, and the chained roundings land one ulp away from the
    // correctly rounded exact value (the float side keeps its historical
    // value by design).
    for (const [exactCtor, floatCtor] of [
      [ExactPressure.kilopascals, Pressure.kilopascals],
      [ExactPressure.megapascals, Pressure.megapascals],
      [ExactPressure.atmospheres, Pressure.atmospheres],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
