import { describe } from "@effect/vitest";

import { testExactRoundtrips } from "./testUtilsExact.ts";
import * as PixelsExact from "../src/PixelsExact.ts";

describe("PixelsExact", () => {
  testExactRoundtrips([[PixelsExact.pixels, PixelsExact.inPixels]]);

  testExactRoundtrips([
    [PixelsExact.pixelsPerSecond, PixelsExact.inPixelsPerSecond],
  ]);

  testExactRoundtrips([
    [PixelsExact.pixelsPerSecondSquared, PixelsExact.inPixelsPerSecondSquared],
  ]);

  testExactRoundtrips([[PixelsExact.squarePixels, PixelsExact.inSquarePixels]]);
});
