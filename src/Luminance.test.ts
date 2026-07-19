import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area.js";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Luminance from "./Luminance.js";
import * as LuminousIntensity from "./LuminousIntensity.js";
import * as Quantity from "./Quantity.js";

describe("Luminance", () => {
  testRoundtrips([
    [Luminance.nits, Luminance.inNits],
    [Luminance.footLamberts, Luminance.inFootLamberts],
  ]);

  testAnchors(Luminance.inNits, [
    [Luminance.footLamberts, 1 / (Math.PI * 0.09290304)],
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
