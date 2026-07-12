import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration";
import * as Energy from "./Energy";
import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Power from "./Power";
import * as Quantity from "./Quantity";

describe("Power", () => {
  testRoundtrip(Power.watts, Power.inWatts);
  testRoundtrip(Power.kilowatts, Power.inKilowatts);
  testRoundtrip(Power.megawatts, Power.inMegawatts);
  testRoundtrip(Power.metricHorsepower, Power.inMetricHorsepower);
  testRoundtrip(Power.mechanicalHorsepower, Power.inMechanicalHorsepower);
  testRoundtrip(Power.electricalHorsepower, Power.inElectricalHorsepower);

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
