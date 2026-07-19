import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import { isQuantityCloseTo, testRoundtrip } from "./internal/testUtils";
import * as LuminousFlux from "./LuminousFlux";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";
import * as SolidAngle from "./SolidAngle";

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
