import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Energy from "../src/Energy.ts";
import * as ExactEnergy from "../src/ExactEnergy.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactEnergy", () => {
  testExactRoundtrips([
    [ExactEnergy.joules, ExactEnergy.inJoules],
    [ExactEnergy.kilojoules, ExactEnergy.inKilojoules],
    [ExactEnergy.megajoules, ExactEnergy.inMegajoules],
    [ExactEnergy.kilowattHours, ExactEnergy.inKilowattHours],
  ]);

  testExactAnchors(ExactEnergy.inJoules, [
    [ExactEnergy.kilojoules, Rational.make(1000n)],
    [ExactEnergy.megajoules, Rational.make(1000000n)],
    [ExactEnergy.kilowattHours, Rational.make(3600000n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        ExactEnergy.inKilojoules(ExactEnergy.kilowattHours(Rational.one)),
        Rational.make(3600n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactEnergy.inMegajoules(ExactEnergy.kilowattHours(Rational.one)),
        Rational.make(18n, 5n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactEnergy.kilojoules, Energy.kilojoules],
      [ExactEnergy.megajoules, Energy.megajoules],
      [ExactEnergy.kilowattHours, Energy.kilowattHours],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
