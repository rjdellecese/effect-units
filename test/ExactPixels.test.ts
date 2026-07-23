import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactPixels from "../src/ExactPixels.ts";

describe("ExactPixels", () => {
  testExactRoundtrips([[ExactPixels.pixels, ExactPixels.inPixels]]);

  testExactRoundtrips([
    [ExactPixels.pixelsPerSecond, ExactPixels.inPixelsPerSecond],
  ]);

  testExactRoundtrips([
    [ExactPixels.pixelsPerSecondSquared, ExactPixels.inPixelsPerSecondSquared],
  ]);

  testExactRoundtrips([[ExactPixels.squarePixels, ExactPixels.inSquarePixels]]);
});
