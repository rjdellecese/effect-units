import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Energy from "./Energy";
import * as Force from "./Force";
import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Energy", () => {
  testRoundtrip(Energy.joules, Energy.inJoules);
  testRoundtrip(Energy.kilojoules, Energy.inKilojoules);
  testRoundtrip(Energy.megajoules, Energy.inMegajoules);
  testRoundtrip(Energy.kilowattHours, Energy.inKilowattHours);

  it("is a force times a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Force.newtons(3), Length.meters(4)),
        Energy.joules(12),
      ),
    );
  });
});
