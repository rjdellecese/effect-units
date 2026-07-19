import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration.js";
import * as Energy from "./Energy.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Power from "./Power.js";
import * as Quantity from "./Quantity.js";

describe("Power", () => {
  testRoundtrips([
    [Power.watts, Power.inWatts],
    [Power.kilowatts, Power.inKilowatts],
    [Power.megawatts, Power.inMegawatts],
    [Power.metricHorsepower, Power.inMetricHorsepower],
    [Power.mechanicalHorsepower, Power.inMechanicalHorsepower],
    [Power.electricalHorsepower, Power.inElectricalHorsepower],
  ]);

  testAnchors(Power.inWatts, [
    [Power.kilowatts, 1e3],
    [Power.megawatts, 1e6],
    [Power.metricHorsepower, 735.49875],
    [Power.mechanicalHorsepower, 745.6998715822702],
    [Power.electricalHorsepower, 746],
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
