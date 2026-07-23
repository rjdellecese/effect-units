import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactMolarity from "../src/ExactMolarity.ts";
import * as Molarity from "../src/Molarity.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactMolarity", () => {
  testExactRoundtrips([
    [ExactMolarity.molesPerCubicMeter, ExactMolarity.inMolesPerCubicMeter],
    [ExactMolarity.molesPerLiter, ExactMolarity.inMolesPerLiter],
    [ExactMolarity.decimolesPerLiter, ExactMolarity.inDecimolesPerLiter],
    [ExactMolarity.centimolesPerLiter, ExactMolarity.inCentimolesPerLiter],
    [ExactMolarity.millimolesPerLiter, ExactMolarity.inMillimolesPerLiter],
    [ExactMolarity.micromolesPerLiter, ExactMolarity.inMicromolesPerLiter],
  ]);

  testExactAnchors(ExactMolarity.inMolesPerCubicMeter, [
    [ExactMolarity.molesPerLiter, Rational.make(1000n)],
    [ExactMolarity.decimolesPerLiter, Rational.make(100n)],
    [ExactMolarity.centimolesPerLiter, Rational.make(10n)],
    [ExactMolarity.millimolesPerLiter, Rational.one],
    [ExactMolarity.micromolesPerLiter, Rational.make(1n, 1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are exact chains", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactMolarity.molesPerLiter, Molarity.molesPerLiter],
      [ExactMolarity.decimolesPerLiter, Molarity.decimolesPerLiter],
      [ExactMolarity.centimolesPerLiter, Molarity.centimolesPerLiter],
      [ExactMolarity.millimolesPerLiter, Molarity.millimolesPerLiter],
      [ExactMolarity.micromolesPerLiter, Molarity.micromolesPerLiter],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
