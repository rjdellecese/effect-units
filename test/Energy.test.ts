import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Energy from "../src/Energy.ts";
import * as Force from "../src/Force.ts";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";

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
