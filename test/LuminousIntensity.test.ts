import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isQuantityCloseTo, testRoundtrip } from "./testUtils.ts";
import * as LuminousFlux from "../src/LuminousFlux.ts";
import * as LuminousIntensity from "../src/LuminousIntensity.ts";
import * as Quantity from "../src/Quantity.ts";
import * as SolidAngle from "../src/SolidAngle.ts";

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
