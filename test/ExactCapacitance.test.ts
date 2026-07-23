import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Capacitance from "../src/Capacitance.ts";
import * as ExactCapacitance from "../src/ExactCapacitance.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactCapacitance", () => {
  testExactRoundtrips([
    [ExactCapacitance.farads, ExactCapacitance.inFarads],
    [ExactCapacitance.picofarads, ExactCapacitance.inPicofarads],
    [ExactCapacitance.nanofarads, ExactCapacitance.inNanofarads],
    [ExactCapacitance.microfarads, ExactCapacitance.inMicrofarads],
  ]);

  testExactAnchors(ExactCapacitance.inFarads, [
    [ExactCapacitance.picofarads, Rational.make(1n, 10n ** 12n)],
    [ExactCapacitance.nanofarads, Rational.make(1n, 10n ** 9n)],
    [ExactCapacitance.microfarads, Rational.make(1n, 10n ** 6n)],
  ]);

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactCapacitance.picofarads, Capacitance.picofarads],
      [ExactCapacitance.nanofarads, Capacitance.nanofarads],
      [ExactCapacitance.microfarads, Capacitance.microfarads],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
