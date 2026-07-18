import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import { isQuantityCloseTo, testRoundtrips } from "./internal/testUtils";
import * as Luminance from "./Luminance";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";

describe("Luminance", () => {
  testRoundtrips([
    [Luminance.nits, Luminance.inNits],
    [Luminance.footLamberts, Luminance.inFootLamberts],
  ]);

  it("is an intensity per an area", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(LuminousIntensity.candelas(10), Area.squareMeters(2)),
        Luminance.nits(5),
      ),
    );
  });
});
