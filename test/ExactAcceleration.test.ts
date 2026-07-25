import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Acceleration from "../src/Acceleration.ts";
import * as ExactAcceleration from "../src/ExactAcceleration.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
import * as ExactSpeed from "../src/ExactSpeed.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactAcceleration", () => {
  testExactRoundtrips([
    [
      ExactAcceleration.metersPerSecondSquared,
      ExactAcceleration.inMetersPerSecondSquared,
    ],
    [
      ExactAcceleration.feetPerSecondSquared,
      ExactAcceleration.inFeetPerSecondSquared,
    ],
    [ExactAcceleration.gees, ExactAcceleration.inGees],
  ]);

  testExactAnchors(ExactAcceleration.inMetersPerSecondSquared, [
    [ExactAcceleration.feetPerSecondSquared, Rational.unsafeMake(381n, 1250n)],
    [ExactAcceleration.gees, Rational.unsafeMake(196133n, 20000n)],
  ]);

  it("is the unit of an exact speed-per-duration rate", () => {
    const rate = ExactQuantity.per(
      ExactSpeed.feetPerSecond(Rational.one),
      ExactQuantity.make("Seconds", Rational.one),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        ExactAcceleration.inFeetPerSecondSquared(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [
        ExactAcceleration.feetPerSecondSquared,
        Acceleration.feetPerSecondSquared,
      ],
      [ExactAcceleration.gees, Acceleration.gees],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
