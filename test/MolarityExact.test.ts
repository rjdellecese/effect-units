import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as MolarityExact from "../src/MolarityExact.ts";
import * as Molarity from "../src/Molarity.ts";
import * as Rational from "../src/Rational.ts";

describe("MolarityExact", () => {
  testExactRoundtrips([
    [MolarityExact.molesPerCubicMeter, MolarityExact.inMolesPerCubicMeter],
    [MolarityExact.molesPerLiter, MolarityExact.inMolesPerLiter],
    [MolarityExact.decimolesPerLiter, MolarityExact.inDecimolesPerLiter],
    [MolarityExact.centimolesPerLiter, MolarityExact.inCentimolesPerLiter],
    [MolarityExact.millimolesPerLiter, MolarityExact.inMillimolesPerLiter],
    [MolarityExact.micromolesPerLiter, MolarityExact.inMicromolesPerLiter],
  ]);

  testExactAnchors(MolarityExact.inMolesPerCubicMeter, [
    [MolarityExact.molesPerLiter, Rational.makeUnsafe(1000n)],
    [MolarityExact.decimolesPerLiter, Rational.makeUnsafe(100n)],
    [MolarityExact.centimolesPerLiter, Rational.makeUnsafe(10n)],
    [MolarityExact.millimolesPerLiter, Rational.one],
    [MolarityExact.micromolesPerLiter, Rational.makeUnsafe(1n, 1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are exact chains", () => {
    for (const [exactCtor, floatCtor] of [
      [MolarityExact.molesPerLiter, Molarity.molesPerLiter],
      [MolarityExact.decimolesPerLiter, Molarity.decimolesPerLiter],
      [MolarityExact.centimolesPerLiter, Molarity.centimolesPerLiter],
      [MolarityExact.millimolesPerLiter, Molarity.millimolesPerLiter],
      [MolarityExact.micromolesPerLiter, Molarity.micromolesPerLiter],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
