import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Current from "../src/Current.ts";
import * as ExactCurrent from "../src/ExactCurrent.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactCurrent", () => {
  testExactRoundtrips([
    [ExactCurrent.amperes, ExactCurrent.inAmperes],
    [ExactCurrent.milliamperes, ExactCurrent.inMilliamperes],
  ]);

  testExactAnchors(ExactCurrent.inAmperes, [
    [ExactCurrent.milliamperes, Rational.make(1n, 1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactCurrent.milliamperes, Current.milliamperes],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
