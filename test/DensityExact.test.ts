import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Density from "../src/Density.ts";
import * as DensityExact from "../src/DensityExact.ts";
import * as Rational from "../src/Rational.ts";

describe("DensityExact", () => {
  testExactRoundtrips([
    [
      DensityExact.kilogramsPerCubicMeter,
      DensityExact.inKilogramsPerCubicMeter,
    ],
    [
      DensityExact.gramsPerCubicCentimeter,
      DensityExact.inGramsPerCubicCentimeter,
    ],
    [DensityExact.poundsPerCubicInch, DensityExact.inPoundsPerCubicInch],
    [DensityExact.poundsPerCubicFoot, DensityExact.inPoundsPerCubicFoot],
  ]);

  testExactAnchors(DensityExact.inKilogramsPerCubicMeter, [
    [DensityExact.gramsPerCubicCentimeter, Rational.unsafeMake(1000n)],
    [
      DensityExact.poundsPerCubicInch,
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
      DensityExact.poundsPerCubicFoot,
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
        DensityExact.inPoundsPerCubicFoot(
          DensityExact.poundsPerCubicInch(Rational.one),
        ),
        Rational.unsafeMake(1728n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [DensityExact.gramsPerCubicCentimeter, Density.gramsPerCubicCentimeter],
      [DensityExact.poundsPerCubicInch, Density.poundsPerCubicInch],
      [DensityExact.poundsPerCubicFoot, Density.poundsPerCubicFoot],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
