import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactIlluminance from "../src/ExactIlluminance.ts";
import * as Illuminance from "../src/Illuminance.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactIlluminance", () => {
  testExactRoundtrips([
    [ExactIlluminance.lux, ExactIlluminance.inLux],
    [ExactIlluminance.footCandles, ExactIlluminance.inFootCandles],
  ]);

  testExactAnchors(ExactIlluminance.inLux, [
    [ExactIlluminance.footCandles, Rational.make(1562500n, 145161n)],
  ]);

  it("matches the float module bit-for-bit where its factors are exact chains", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactIlluminance.footCandles, Illuminance.footCandles],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
