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
    [ExactDensity.gramsPerCubicCentimeter, Rational.make(1000n)],
    [
      ExactDensity.poundsPerCubicInch,
      Rational.unsafeDivide(
        Rational.make(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.make(127n, 5000n),
          Rational.make(127n, 5000n),
          Rational.make(127n, 5000n),
        ]),
      ),
    ],
    [
      ExactDensity.poundsPerCubicFoot,
      Rational.unsafeDivide(
        Rational.make(45359237n, 100000000n),
        Rational.multiplyAll([
          Rational.make(381n, 1250n),
          Rational.make(381n, 1250n),
          Rational.make(381n, 1250n),
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
        Rational.make(1728n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    // No gramsPerCubicCentimeter or poundsPerCubicInch here: the float
    // factors divide by a cubed length factor, and the chained roundings
    // land one ulp away from the correctly rounded exact value (the float
    // side keeps its historical value by design).
    for (const [exactCtor, floatCtor] of [
      [ExactDensity.poundsPerCubicFoot, Density.poundsPerCubicFoot],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
