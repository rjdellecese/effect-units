import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as SubstanceAmountExact from "../src/SubstanceAmountExact.ts";
import * as Rational from "../src/Rational.ts";
import * as SubstanceAmount from "../src/SubstanceAmount.ts";

describe("SubstanceAmountExact", () => {
  testExactRoundtrips([
    [SubstanceAmountExact.moles, SubstanceAmountExact.inMoles],
    [SubstanceAmountExact.picomoles, SubstanceAmountExact.inPicomoles],
    [SubstanceAmountExact.nanomoles, SubstanceAmountExact.inNanomoles],
    [SubstanceAmountExact.micromoles, SubstanceAmountExact.inMicromoles],
    [SubstanceAmountExact.millimoles, SubstanceAmountExact.inMillimoles],
    [SubstanceAmountExact.centimoles, SubstanceAmountExact.inCentimoles],
    [SubstanceAmountExact.decimoles, SubstanceAmountExact.inDecimoles],
    [SubstanceAmountExact.kilomoles, SubstanceAmountExact.inKilomoles],
    [SubstanceAmountExact.megamoles, SubstanceAmountExact.inMegamoles],
    [SubstanceAmountExact.gigamoles, SubstanceAmountExact.inGigamoles],
  ]);

  testExactAnchors(SubstanceAmountExact.inMoles, [
    [SubstanceAmountExact.picomoles, Rational.unsafeMake(1n, 10n ** 12n)],
    [SubstanceAmountExact.nanomoles, Rational.unsafeMake(1n, 10n ** 9n)],
    [SubstanceAmountExact.micromoles, Rational.unsafeMake(1n, 10n ** 6n)],
    [SubstanceAmountExact.millimoles, Rational.unsafeMake(1n, 1000n)],
    [SubstanceAmountExact.centimoles, Rational.unsafeMake(1n, 100n)],
    [SubstanceAmountExact.decimoles, Rational.unsafeMake(1n, 10n)],
    [SubstanceAmountExact.kilomoles, Rational.unsafeMake(1000n)],
    [SubstanceAmountExact.megamoles, Rational.unsafeMake(10n ** 6n)],
    [SubstanceAmountExact.gigamoles, Rational.unsafeMake(10n ** 9n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [SubstanceAmountExact.picomoles, SubstanceAmount.picomoles],
      [SubstanceAmountExact.nanomoles, SubstanceAmount.nanomoles],
      [SubstanceAmountExact.micromoles, SubstanceAmount.micromoles],
      [SubstanceAmountExact.millimoles, SubstanceAmount.millimoles],
      [SubstanceAmountExact.centimoles, SubstanceAmount.centimoles],
      [SubstanceAmountExact.decimoles, SubstanceAmount.decimoles],
      [SubstanceAmountExact.kilomoles, SubstanceAmount.kilomoles],
      [SubstanceAmountExact.megamoles, SubstanceAmount.megamoles],
      [SubstanceAmountExact.gigamoles, SubstanceAmount.gigamoles],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
