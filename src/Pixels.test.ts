import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Duration from "./Duration.js";
import { isQuantityCloseTo, testRoundtrip } from "../test/testUtils.js";
import * as Pixels from "./Pixels.js";
import * as Quantity from "./Quantity.js";

describe("Pixels", () => {
  testRoundtrip(Pixels.pixels, Pixels.inPixels);
  testRoundtrip(Pixels.pixelsPerSecond, Pixels.inPixelsPerSecond);
  testRoundtrip(Pixels.pixelsPerSecondSquared, Pixels.inPixelsPerSecondSquared);
  testRoundtrip(Pixels.squarePixels, Pixels.inSquarePixels);

  it("pixels per second is pixels per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Pixels.pixels(10), Duration.seconds(2)),
        Pixels.pixelsPerSecond(5),
      ),
    );
  });

  it("square pixels is the product of two pixel quantities", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.times(Pixels.pixels(3), Pixels.pixels(4)),
        Pixels.squarePixels(12),
      ),
    );
  });
});
