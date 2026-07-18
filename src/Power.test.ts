import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration";
import * as Energy from "./Energy";
import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Power from "./Power";
import * as Quantity from "./Quantity";

describe("Power", () => {
  testRoundtrips([
    [Power.watts, Power.inWatts],
    [Power.kilowatts, Power.inKilowatts],
    [Power.megawatts, Power.inMegawatts],
    [Power.metricHorsepower, Power.inMetricHorsepower],
    [Power.mechanicalHorsepower, Power.inMechanicalHorsepower],
    [Power.electricalHorsepower, Power.inElectricalHorsepower],
  ]);

  it("is an energy per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Energy.joules(10), Duration.seconds(2)),
        Power.watts(5),
      ),
    );
  });

  it("relates kilowatts and hours to kilowatt hours", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.at(Power.kilowatts(2), Duration.hours(3)),
        Energy.kilowattHours(6),
      ),
    );
  });
});
