import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as InductanceExact from "../src/InductanceExact.ts";
import * as Inductance from "../src/Inductance.ts";
import * as Rational from "../src/Rational.ts";

describe("InductanceExact", () => {
  testExactRoundtrips([
    [InductanceExact.henries, InductanceExact.inHenries],
    [InductanceExact.nanohenries, InductanceExact.inNanohenries],
    [InductanceExact.microhenries, InductanceExact.inMicrohenries],
    [InductanceExact.millihenries, InductanceExact.inMillihenries],
    [InductanceExact.kilohenries, InductanceExact.inKilohenries],
  ]);

  testExactAnchors(InductanceExact.inHenries, [
    [InductanceExact.nanohenries, Rational.unsafeMake(1n, 10n ** 9n)],
    [InductanceExact.microhenries, Rational.unsafeMake(1n, 10n ** 6n)],
    [InductanceExact.millihenries, Rational.unsafeMake(1n, 1000n)],
    [InductanceExact.kilohenries, Rational.unsafeMake(1000n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [InductanceExact.nanohenries, Inductance.nanohenries],
      [InductanceExact.microhenries, Inductance.microhenries],
      [InductanceExact.millihenries, Inductance.millihenries],
      [InductanceExact.kilohenries, Inductance.kilohenries],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
