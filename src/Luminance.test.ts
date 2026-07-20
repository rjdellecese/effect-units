import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area.ts";
import {
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.ts";
import * as Luminance from "./Luminance.ts";
import * as LuminousIntensity from "./LuminousIntensity.ts";
import * as Quantity from "./Quantity.ts";

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
