import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import * as Illuminance from "./Illuminance";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "./internal/testUtils";
import * as LuminousFlux from "./LuminousFlux";
import * as Quantity from "./Quantity";

describe("Illuminance", () => {
  testRoundtrips([
    [Illuminance.lux, Illuminance.inLux],
    [Illuminance.footCandles, Illuminance.inFootCandles],
  ]);

  testAnchors(Illuminance.inLux, [[Illuminance.footCandles, 1 / 0.09290304]]);

  it("is a flux per an area", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(LuminousFlux.lumens(10), Area.squareMeters(2)),
        Illuminance.lux(5),
      ),
    );
  });
});
