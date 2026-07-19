import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isQuantityCloseTo, testRoundtrip } from "../test/testUtils.js";
import * as LuminousFlux from "./LuminousFlux.js";
import * as LuminousIntensity from "./LuminousIntensity.js";
import * as Quantity from "./Quantity.js";
import * as SolidAngle from "./SolidAngle.js";

describe("LuminousFlux and LuminousIntensity", () => {
  testRoundtrip(LuminousFlux.lumens, LuminousFlux.inLumens);
  testRoundtrip(LuminousIntensity.candelas, LuminousIntensity.inCandelas);

  it("luminous intensity is a flux per a solid angle", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(LuminousFlux.lumens(10), SolidAngle.steradians(2)),
        LuminousIntensity.candelas(5),
      ),
    );
  });
});
