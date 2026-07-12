import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Force from "./Force";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Torque from "./Torque";

describe("Torque", () => {
  const roundtrip = [
    { there: Torque.newtonMeters, back: Torque.inNewtonMeters },
    { there: Torque.poundFeet, back: Torque.inPoundFeet },
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
        Quantity.times(Force.pounds(1), Length.feet(1)),
        Torque.poundFeet(1),
      ),
    );
  });
});
