import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import * as Illuminance from "./Illuminance";
import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as LuminousFlux from "./LuminousFlux";
import * as Quantity from "./Quantity";

describe("Illuminance", () => {
  testRoundtrip(Illuminance.lux, Illuminance.inLux);
  testRoundtrip(Illuminance.footCandles, Illuminance.inFootCandles);

  it("is a flux per an area", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(LuminousFlux.lumens(10), Area.squareMeters(2)),
        Illuminance.lux(5),
      ),
    );
  });
});
