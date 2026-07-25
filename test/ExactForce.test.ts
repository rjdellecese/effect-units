import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactForce from "../src/ExactForce.ts";
import * as Force from "../src/Force.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactForce", () => {
  testExactRoundtrips([
    [ExactForce.newtons, ExactForce.inNewtons],
    [ExactForce.kilonewtons, ExactForce.inKilonewtons],
    [ExactForce.meganewtons, ExactForce.inMeganewtons],
    [ExactForce.pounds, ExactForce.inPounds],
    [ExactForce.kips, ExactForce.inKips],
  ]);

  testExactAnchors(ExactForce.inNewtons, [
    [ExactForce.kilonewtons, Rational.unsafeMake(1000n)],
    [ExactForce.meganewtons, Rational.unsafeMake(1000000n)],
    [
      ExactForce.pounds,
      Rational.multiply(
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.unsafeMake(196133n, 20000n),
      ),
    ],
    [
      ExactForce.kips,
      Rational.multiplyAll([
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.unsafeMake(196133n, 20000n),
        Rational.unsafeMake(1000n),
      ]),
    ],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactForce.inPounds(ExactForce.kips(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactForce.inNewtons(ExactForce.kilonewtons(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactForce.kilonewtons, Force.kilonewtons],
      [ExactForce.meganewtons, Force.meganewtons],
      [ExactForce.pounds, Force.pounds],
      [ExactForce.kips, Force.kips],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
