import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Energy from "../src/Energy.ts";
import * as EnergyExact from "../src/EnergyExact.ts";
import * as Rational from "../src/Rational.ts";

describe("EnergyExact", () => {
  testExactRoundtrips([
    [EnergyExact.joules, EnergyExact.inJoules],
    [EnergyExact.kilojoules, EnergyExact.inKilojoules],
    [EnergyExact.megajoules, EnergyExact.inMegajoules],
    [EnergyExact.kilowattHours, EnergyExact.inKilowattHours],
  ]);

  testExactAnchors(EnergyExact.inJoules, [
    [EnergyExact.kilojoules, Rational.makeUnsafe(1000n)],
    [EnergyExact.megajoules, Rational.makeUnsafe(1000000n)],
    [EnergyExact.kilowattHours, Rational.makeUnsafe(3600000n)],
  ]);

  it("relates units exactly", () => {
    assertTrue(
      Equal.equals(
        EnergyExact.inKilojoules(EnergyExact.kilowattHours(Rational.one)),
        Rational.makeUnsafe(3600n),
      ),
    );
    assertTrue(
      Equal.equals(
        EnergyExact.inMegajoules(EnergyExact.kilowattHours(Rational.one)),
        Rational.makeUnsafe(18n, 5n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [EnergyExact.kilojoules, Energy.kilojoules],
      [EnergyExact.megajoules, Energy.megajoules],
      [EnergyExact.kilowattHours, Energy.kilowattHours],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
