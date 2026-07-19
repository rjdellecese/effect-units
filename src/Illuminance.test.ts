import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area.js";
import * as Illuminance from "./Illuminance.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as LuminousFlux from "./LuminousFlux.js";
import * as Quantity from "./Quantity.js";

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
