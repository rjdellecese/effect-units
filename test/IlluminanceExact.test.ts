import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as IlluminanceExact from "../src/IlluminanceExact.ts";
import * as Illuminance from "../src/Illuminance.ts";
import * as Rational from "../src/Rational.ts";

describe("IlluminanceExact", () => {
  testExactRoundtrips([
    [IlluminanceExact.lux, IlluminanceExact.inLux],
    [IlluminanceExact.footCandles, IlluminanceExact.inFootCandles],
  ]);

  testExactAnchors(IlluminanceExact.inLux, [
    [IlluminanceExact.footCandles, Rational.makeUnsafe(1562500n, 145161n)],
  ]);

  it("matches the float module bit-for-bit where its factors are exact chains", () => {
    for (const [exactCtor, floatCtor] of [
      [IlluminanceExact.footCandles, Illuminance.footCandles],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
