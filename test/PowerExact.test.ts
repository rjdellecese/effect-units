import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as EnergyExact from "../src/EnergyExact.ts";
import * as PowerExact from "../src/PowerExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as Power from "../src/Power.ts";
import * as Rational from "../src/Rational.ts";

describe("PowerExact", () => {
  testExactRoundtrips([
    [PowerExact.watts, PowerExact.inWatts],
    [PowerExact.kilowatts, PowerExact.inKilowatts],
    [PowerExact.megawatts, PowerExact.inMegawatts],
    [PowerExact.metricHorsepower, PowerExact.inMetricHorsepower],
    [PowerExact.mechanicalHorsepower, PowerExact.inMechanicalHorsepower],
    [PowerExact.electricalHorsepower, PowerExact.inElectricalHorsepower],
  ]);

  testExactAnchors(PowerExact.inWatts, [
    [PowerExact.kilowatts, Rational.makeUnsafe(1000n)],
    [PowerExact.megawatts, Rational.makeUnsafe(1000000n)],
    [PowerExact.metricHorsepower, Rational.makeUnsafe(588399n, 800n)],
    [
      PowerExact.mechanicalHorsepower,
      Rational.multiplyAll([
        Rational.makeUnsafe(550n),
        Rational.makeUnsafe(45359237n, 100000000n),
        Rational.makeUnsafe(196133n, 20000n),
        Rational.makeUnsafe(381n, 1250n),
      ]),
    ],
    [PowerExact.electricalHorsepower, Rational.makeUnsafe(746n)],
  ]);

  it("is the unit of an exact energy-per-duration rate", () => {
    const rate = QuantityExact.per(
      EnergyExact.kilowattHours(Rational.one),
      QuantityExact.make("Seconds", Rational.makeUnsafe(3600n)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        PowerExact.inKilowatts(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [PowerExact.kilowatts, Power.kilowatts],
      [PowerExact.megawatts, Power.megawatts],
      [PowerExact.metricHorsepower, Power.metricHorsepower],
      [PowerExact.mechanicalHorsepower, Power.mechanicalHorsepower],
      [PowerExact.electricalHorsepower, Power.electricalHorsepower],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
