import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Current from "../src/Current.ts";
import * as CurrentExact from "../src/CurrentExact.ts";
import * as Rational from "../src/Rational.ts";

describe("CurrentExact", () => {
  testExactRoundtrips([
    [CurrentExact.amperes, CurrentExact.inAmperes],
    [CurrentExact.milliamperes, CurrentExact.inMilliamperes],
  ]);

  testExactAnchors(CurrentExact.inAmperes, [
    [CurrentExact.milliamperes, Rational.unsafeMake(1n, 1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [CurrentExact.milliamperes, Current.milliamperes],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
