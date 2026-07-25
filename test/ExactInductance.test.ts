import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactInductance from "../src/ExactInductance.ts";
import * as Inductance from "../src/Inductance.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactInductance", () => {
  testExactRoundtrips([
    [ExactInductance.henries, ExactInductance.inHenries],
    [ExactInductance.nanohenries, ExactInductance.inNanohenries],
    [ExactInductance.microhenries, ExactInductance.inMicrohenries],
    [ExactInductance.millihenries, ExactInductance.inMillihenries],
    [ExactInductance.kilohenries, ExactInductance.inKilohenries],
  ]);

  testExactAnchors(ExactInductance.inHenries, [
    [ExactInductance.nanohenries, Rational.unsafeMake(1n, 10n ** 9n)],
    [ExactInductance.microhenries, Rational.unsafeMake(1n, 10n ** 6n)],
    [ExactInductance.millihenries, Rational.unsafeMake(1n, 1000n)],
    [ExactInductance.kilohenries, Rational.unsafeMake(1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactInductance.nanohenries, Inductance.nanohenries],
      [ExactInductance.microhenries, Inductance.microhenries],
      [ExactInductance.millihenries, Inductance.millihenries],
      [ExactInductance.kilohenries, Inductance.kilohenries],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
