import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactSubstanceAmount from "../src/ExactSubstanceAmount.ts";
import * as Rational from "../src/Rational.ts";
import * as SubstanceAmount from "../src/SubstanceAmount.ts";

describe("ExactSubstanceAmount", () => {
  testExactRoundtrips([
    [ExactSubstanceAmount.moles, ExactSubstanceAmount.inMoles],
    [ExactSubstanceAmount.picomoles, ExactSubstanceAmount.inPicomoles],
    [ExactSubstanceAmount.nanomoles, ExactSubstanceAmount.inNanomoles],
    [ExactSubstanceAmount.micromoles, ExactSubstanceAmount.inMicromoles],
    [ExactSubstanceAmount.millimoles, ExactSubstanceAmount.inMillimoles],
    [ExactSubstanceAmount.centimoles, ExactSubstanceAmount.inCentimoles],
    [ExactSubstanceAmount.decimoles, ExactSubstanceAmount.inDecimoles],
    [ExactSubstanceAmount.kilomoles, ExactSubstanceAmount.inKilomoles],
    [ExactSubstanceAmount.megamoles, ExactSubstanceAmount.inMegamoles],
    [ExactSubstanceAmount.gigamoles, ExactSubstanceAmount.inGigamoles],
  ]);

  testExactAnchors(ExactSubstanceAmount.inMoles, [
    [ExactSubstanceAmount.picomoles, Rational.make(1n, 10n ** 12n)],
    [ExactSubstanceAmount.nanomoles, Rational.make(1n, 10n ** 9n)],
    [ExactSubstanceAmount.micromoles, Rational.make(1n, 10n ** 6n)],
    [ExactSubstanceAmount.millimoles, Rational.make(1n, 1000n)],
    [ExactSubstanceAmount.centimoles, Rational.make(1n, 100n)],
    [ExactSubstanceAmount.decimoles, Rational.make(1n, 10n)],
    [ExactSubstanceAmount.kilomoles, Rational.make(1000n)],
    [ExactSubstanceAmount.megamoles, Rational.make(10n ** 6n)],
    [ExactSubstanceAmount.gigamoles, Rational.make(10n ** 9n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactSubstanceAmount.picomoles, SubstanceAmount.picomoles],
      [ExactSubstanceAmount.nanomoles, SubstanceAmount.nanomoles],
      [ExactSubstanceAmount.micromoles, SubstanceAmount.micromoles],
      [ExactSubstanceAmount.millimoles, SubstanceAmount.millimoles],
      [ExactSubstanceAmount.centimoles, SubstanceAmount.centimoles],
      [ExactSubstanceAmount.decimoles, SubstanceAmount.decimoles],
      [ExactSubstanceAmount.kilomoles, SubstanceAmount.kilomoles],
      [ExactSubstanceAmount.megamoles, SubstanceAmount.megamoles],
      [ExactSubstanceAmount.gigamoles, SubstanceAmount.gigamoles],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
