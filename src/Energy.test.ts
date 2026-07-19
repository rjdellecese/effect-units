import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Energy from "./Energy";
import * as Force from "./Force";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Energy", () => {
  testRoundtrips([
    [Energy.joules, Energy.inJoules],
    [Energy.kilojoules, Energy.inKilojoules],
    [Energy.megajoules, Energy.inMegajoules],
    [Energy.kilowattHours, Energy.inKilowattHours],
  ]);

  testAnchors(Energy.inJoules, [
    [Energy.kilojoules, 1e3],
    [Energy.megajoules, 1e6],
    [Energy.kilowattHours, 3.6e6],
  ]);

  it("is a force times a length", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Force.newtons(3), Length.meters(4)),
        Energy.joules(12),
      ),
    );
  });
});
