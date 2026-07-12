import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as LuminousFlux from "./LuminousFlux";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";
import * as SolidAngle from "./SolidAngle";

describe("LuminousFlux and LuminousIntensity", () => {
  const testRoundtrip = <Q>(
    there: (n: number) => Q,
    back: (q: Q) => number,
  ) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  };

  testRoundtrip(LuminousFlux.lumens, LuminousFlux.inLumens);
  testRoundtrip(LuminousIntensity.candelas, LuminousIntensity.inCandelas);

  it("luminous intensity is a flux per a solid angle", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(LuminousFlux.lumens(10), SolidAngle.steradians(2)),
        LuminousIntensity.candelas(5),
      ),
    );
  });
});
