import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Duration from "./Duration";
import * as Energy from "./Energy";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Power from "./Power";
import * as Quantity from "./Quantity";

describe("Power", () => {
  const roundtrip = [
    { there: Power.watts, back: Power.inWatts },
    { there: Power.kilowatts, back: Power.inKilowatts },
    { there: Power.megawatts, back: Power.inMegawatts },
    { there: Power.metricHorsepower, back: Power.inMetricHorsepower },
    { there: Power.mechanicalHorsepower, back: Power.inMechanicalHorsepower },
    { there: Power.electricalHorsepower, back: Power.inElectricalHorsepower },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("is an energy per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Energy.joules(10), Duration.seconds(2)),
        Power.watts(5),
      ),
    );
  });

  it("relates kilowatts and hours to kilowatt hours", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.at(Power.kilowatts(2), Duration.hours(3)),
        Energy.kilowattHours(6),
      ),
    );
  });
});
