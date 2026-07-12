import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Energy from "./Energy";
import * as Force from "./Force";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";

describe("Energy", () => {
  const roundtrip = [
    { there: Energy.joules, back: Energy.inJoules },
    { there: Energy.kilojoules, back: Energy.inKilojoules },
    { there: Energy.megajoules, back: Energy.inMegajoules },
    { there: Energy.kilowattHours, back: Energy.inKilowattHours },
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

  it("is a force times a length", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(Force.newtons(3), Length.meters(4)),
        Energy.joules(12),
      ),
    );
  });
});
