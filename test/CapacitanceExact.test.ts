import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Capacitance from "../src/Capacitance.ts";
import * as CapacitanceExact from "../src/CapacitanceExact.ts";
import * as Rational from "../src/Rational.ts";

describe("CapacitanceExact", () => {
  testExactRoundtrips([
    [CapacitanceExact.farads, CapacitanceExact.inFarads],
    [CapacitanceExact.picofarads, CapacitanceExact.inPicofarads],
    [CapacitanceExact.nanofarads, CapacitanceExact.inNanofarads],
    [CapacitanceExact.microfarads, CapacitanceExact.inMicrofarads],
  ]);

  testExactAnchors(CapacitanceExact.inFarads, [
    [CapacitanceExact.picofarads, Rational.unsafeMake(1n, 10n ** 12n)],
    [CapacitanceExact.nanofarads, Rational.unsafeMake(1n, 10n ** 9n)],
    [CapacitanceExact.microfarads, Rational.unsafeMake(1n, 10n ** 6n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [CapacitanceExact.picofarads, Capacitance.picofarads],
      [CapacitanceExact.nanofarads, Capacitance.nanofarads],
      [CapacitanceExact.microfarads, Capacitance.microfarads],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
