import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Acceleration from "../src/Acceleration.ts";
import * as AccelerationExact from "../src/AccelerationExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as SpeedExact from "../src/SpeedExact.ts";
import * as Rational from "../src/Rational.ts";

describe("AccelerationExact", () => {
  testExactRoundtrips([
    [
      AccelerationExact.metersPerSecondSquared,
      AccelerationExact.inMetersPerSecondSquared,
    ],
    [
      AccelerationExact.feetPerSecondSquared,
      AccelerationExact.inFeetPerSecondSquared,
    ],
    [AccelerationExact.gees, AccelerationExact.inGees],
  ]);

  testExactAnchors(AccelerationExact.inMetersPerSecondSquared, [
    [AccelerationExact.feetPerSecondSquared, Rational.makeUnsafe(381n, 1250n)],
    [AccelerationExact.gees, Rational.makeUnsafe(196133n, 20000n)],
  ]);

  it("is the unit of an exact speed-per-duration rate", () => {
    const rate = QuantityExact.per(
      SpeedExact.feetPerSecond(Rational.one),
      QuantityExact.make("Seconds", Rational.one),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        AccelerationExact.inFeetPerSecondSquared(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [
        AccelerationExact.feetPerSecondSquared,
        Acceleration.feetPerSecondSquared,
      ],
      [AccelerationExact.gees, Acceleration.gees],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
