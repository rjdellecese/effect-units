import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactForce from "../src/ExactForce.ts";
import * as ExactLength from "../src/ExactLength.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
import * as ExactTorque from "../src/ExactTorque.ts";
import * as Rational from "../src/Rational.ts";
import * as Torque from "../src/Torque.ts";

describe("ExactTorque", () => {
  testExactRoundtrips([
    [ExactTorque.newtonMeters, ExactTorque.inNewtonMeters],
    [ExactTorque.poundFeet, ExactTorque.inPoundFeet],
  ]);

  testExactAnchors(ExactTorque.inNewtonMeters, [
    [
      ExactTorque.poundFeet,
      Rational.multiplyAll([
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.unsafeMake(196133n, 20000n),
        Rational.unsafeMake(381n, 1250n),
      ]),
    ],
  ]);

  it("is an exact pound of force times an exact foot", () => {
    const torque = ExactQuantity.times(
      ExactForce.pounds(Rational.one),
      ExactLength.feet(Rational.one),
    );

    assertTrue(Equal.equals(ExactTorque.inPoundFeet(torque), Rational.one));
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactTorque.poundFeet, Torque.poundFeet],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
