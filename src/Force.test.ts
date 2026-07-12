import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Acceleration from "./Acceleration";
import * as Force from "./Force";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";

describe("Force", () => {
  const roundtrip = [
    { there: Force.newtons, back: Force.inNewtons },
    { there: Force.kilonewtons, back: Force.inKilonewtons },
    { there: Force.meganewtons, back: Force.inMeganewtons },
    { there: Force.pounds, back: Force.inPounds },
    { there: Force.kips, back: Force.inKips },
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

  it("is a mass times an acceleration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(
          Mass.kilograms(1),
          Acceleration.metersPerSecondSquared(1),
        ),
        Force.newtons(1),
      ),
    );
  });

  it("relates pounds of force to mass under standard gravity", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(Mass.pounds(1), Acceleration.gees(1)),
        Force.pounds(1),
      ),
    );
  });
});
