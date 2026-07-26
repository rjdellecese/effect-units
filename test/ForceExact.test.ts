import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as ForceExact from "../src/ForceExact.ts";
import * as Force from "../src/Force.ts";
import * as Rational from "../src/Rational.ts";

describe("ForceExact", () => {
  testExactRoundtrips([
    [ForceExact.newtons, ForceExact.inNewtons],
    [ForceExact.kilonewtons, ForceExact.inKilonewtons],
    [ForceExact.meganewtons, ForceExact.inMeganewtons],
    [ForceExact.pounds, ForceExact.inPounds],
    [ForceExact.kips, ForceExact.inKips],
  ]);

  testExactAnchors(ForceExact.inNewtons, [
    [ForceExact.kilonewtons, Rational.unsafeMake(1000n)],
    [ForceExact.meganewtons, Rational.unsafeMake(1000000n)],
    [
      ForceExact.pounds,
      Rational.multiply(
        Rational.unsafeMake(45359237n, 100000000n),
        Rational.unsafeMake(196133n, 20000n),
      ),
    ],
    [
      ForceExact.kips,
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
        ForceExact.inPounds(ForceExact.kips(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
    assertTrue(
      Equal.equals(
        ForceExact.inNewtons(ForceExact.kilonewtons(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ForceExact.kilonewtons, Force.kilonewtons],
      [ForceExact.meganewtons, Force.meganewtons],
      [ForceExact.pounds, Force.pounds],
      [ForceExact.kips, Force.kips],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
