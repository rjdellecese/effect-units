import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactEnergy from "../src/ExactEnergy.ts";
import * as ExactPower from "../src/ExactPower.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
import * as Power from "../src/Power.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactPower", () => {
  testExactRoundtrips([
    [ExactPower.watts, ExactPower.inWatts],
    [ExactPower.kilowatts, ExactPower.inKilowatts],
    [ExactPower.megawatts, ExactPower.inMegawatts],
    [ExactPower.metricHorsepower, ExactPower.inMetricHorsepower],
    [ExactPower.mechanicalHorsepower, ExactPower.inMechanicalHorsepower],
    [ExactPower.electricalHorsepower, ExactPower.inElectricalHorsepower],
  ]);

  testExactAnchors(ExactPower.inWatts, [
    [ExactPower.kilowatts, Rational.make(1000n)],
    [ExactPower.megawatts, Rational.make(1000000n)],
    [ExactPower.metricHorsepower, Rational.make(588399n, 800n)],
    [
      ExactPower.mechanicalHorsepower,
      Rational.multiplyAll([
        Rational.make(550n),
        Rational.make(45359237n, 100000000n),
        Rational.make(196133n, 20000n),
        Rational.make(381n, 1250n),
      ]),
    ],
    [ExactPower.electricalHorsepower, Rational.make(746n)],
  ]);

  it("is the unit of an exact energy-per-duration rate", () => {
    const rate = ExactQuantity.per(
      ExactEnergy.kilowattHours(Rational.one),
      ExactQuantity.make("Seconds", Rational.make(3600n)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        ExactPower.inKilowatts(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });

  it("matches the float module bit-for-bit where its factors are leaves", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactPower.kilowatts, Power.kilowatts],
      [ExactPower.megawatts, Power.megawatts],
      [ExactPower.metricHorsepower, Power.metricHorsepower],
      [ExactPower.mechanicalHorsepower, Power.mechanicalHorsepower],
      [ExactPower.electricalHorsepower, Power.electricalHorsepower],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
