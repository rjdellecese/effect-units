import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Charge from "../src/Charge.ts";
import * as ChargeExact from "../src/ChargeExact.ts";
import * as Rational from "../src/Rational.ts";

describe("ChargeExact", () => {
  testExactRoundtrips([
    [ChargeExact.coulombs, ChargeExact.inCoulombs],
    [ChargeExact.ampereHours, ChargeExact.inAmpereHours],
    [ChargeExact.milliampereHours, ChargeExact.inMilliampereHours],
  ]);

  testExactAnchors(ChargeExact.inCoulombs, [
    [ChargeExact.ampereHours, Rational.makeUnsafe(3600n)],
    [ChargeExact.milliampereHours, Rational.makeUnsafe(18n, 5n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ChargeExact.ampereHours, Charge.ampereHours],
      [ChargeExact.milliampereHours, Charge.milliampereHours],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
