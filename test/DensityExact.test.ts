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
    [DensityExact.gramsPerCubicCentimeter, Rational.makeUnsafe(1000n)],
    [
      DensityExact.poundsPerCubicInch,
      Rational.divideUnsafe(
        Rational.makeUnsafe(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.makeUnsafe(127n, 5000n),
          Rational.makeUnsafe(127n, 5000n),
          Rational.makeUnsafe(127n, 5000n),
        ]),
      ),
    ],
    [
      DensityExact.poundsPerCubicFoot,
      Rational.divideUnsafe(
        Rational.makeUnsafe(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.makeUnsafe(381n, 1250n),
          Rational.makeUnsafe(381n, 1250n),
          Rational.makeUnsafe(381n, 1250n),
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
        Rational.makeUnsafe(1728n),
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
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
