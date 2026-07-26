import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as ForceExact from "../src/ForceExact.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as TorqueExact from "../src/TorqueExact.ts";
import * as Rational from "../src/Rational.ts";
import * as Torque from "../src/Torque.ts";

describe("TorqueExact", () => {
  testExactRoundtrips([
    [TorqueExact.newtonMeters, TorqueExact.inNewtonMeters],
    [TorqueExact.poundFeet, TorqueExact.inPoundFeet],
  ]);

  testExactAnchors(TorqueExact.inNewtonMeters, [
    [
      TorqueExact.poundFeet,
      Rational.multiplyAll([
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.unsafeMake(196133n, 20000n),
        Rational.unsafeMake(381n, 1250n),
      ]),
    ],
  ]);

  it("is an exact pound of force times an exact foot", () => {
    const torque = QuantityExact.times(
      ForceExact.pounds(Rational.one),
      LengthExact.feet(Rational.one),
    );

    assertTrue(Equal.equals(TorqueExact.inPoundFeet(torque), Rational.one));
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [TorqueExact.poundFeet, Torque.poundFeet],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
