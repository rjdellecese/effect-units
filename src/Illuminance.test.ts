import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Area from "./Area";
import * as Illuminance from "./Illuminance";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as LuminousFlux from "./LuminousFlux";
import * as Quantity from "./Quantity";

describe("Illuminance", () => {
  const roundtrip = [
    { there: Illuminance.lux, back: Illuminance.inLux },
    { there: Illuminance.footCandles, back: Illuminance.inFootCandles },
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

  it("is a flux per an area", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(LuminousFlux.lumens(10), Area.squareMeters(2)),
        Illuminance.lux(5),
      ),
    );
  });
});
