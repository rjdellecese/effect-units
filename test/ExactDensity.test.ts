import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Density from "../src/Density.ts";
import * as ExactDensity from "../src/ExactDensity.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactDensity", () => {
  testExactRoundtrips([
    [
      ExactDensity.kilogramsPerCubicMeter,
      ExactDensity.inKilogramsPerCubicMeter,
    ],
    [
      ExactDensity.gramsPerCubicCentimeter,
      ExactDensity.inGramsPerCubicCentimeter,
    ],
    [ExactDensity.poundsPerCubicInch, ExactDensity.inPoundsPerCubicInch],
    [ExactDensity.poundsPerCubicFoot, ExactDensity.inPoundsPerCubicFoot],
  ]);

  testExactAnchors(ExactDensity.inKilogramsPerCubicMeter, [
    [ExactDensity.gramsPerCubicCentimeter, Rational.unsafeMake(1000n)],
    [
      ExactDensity.poundsPerCubicInch,
      Rational.unsafeDivide(
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.unsafeMake(127n, 5000n),
          Rational.unsafeMake(127n, 5000n),
          Rational.unsafeMake(127n, 5000n),
        ]),
      ),
    ],
    [
      ExactDensity.poundsPerCubicFoot,
      Rational.unsafeDivide(
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.unsafeMake(381n, 1250n),
          Rational.unsafeMake(381n, 1250n),
          Rational.unsafeMake(381n, 1250n),
        ]),
      ),
    ],
  ]);

  it("relates units exactly", () => {
    // A cubic foot is 12^3 cubic inches.
    assertTrue(
      Equal.equals(
        ExactDensity.inPoundsPerCubicFoot(
          ExactDensity.poundsPerCubicInch(Rational.one),
        ),
        Rational.unsafeMake(1728n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactDensity.gramsPerCubicCentimeter, Density.gramsPerCubicCentimeter],
      [ExactDensity.poundsPerCubicInch, Density.poundsPerCubicInch],
      [ExactDensity.poundsPerCubicFoot, Density.poundsPerCubicFoot],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
