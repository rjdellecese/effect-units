import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "../src/Area.ts";
import * as Illuminance from "../src/Illuminance.ts";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as LuminousFlux from "../src/LuminousFlux.ts";
import * as Quantity from "../src/Quantity.ts";

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
