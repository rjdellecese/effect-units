import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Charge from "../src/Charge.ts";
import * as ExactCharge from "../src/ExactCharge.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactCharge", () => {
  testExactRoundtrips([
    [ExactCharge.coulombs, ExactCharge.inCoulombs],
    [ExactCharge.ampereHours, ExactCharge.inAmpereHours],
    [ExactCharge.milliampereHours, ExactCharge.inMilliampereHours],
  ]);

  testExactAnchors(ExactCharge.inCoulombs, [
    [ExactCharge.ampereHours, Rational.make(3600n)],
    [ExactCharge.milliampereHours, Rational.make(18n, 5n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactCharge.ampereHours, Charge.ampereHours],
      [ExactCharge.milliampereHours, Charge.milliampereHours],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
