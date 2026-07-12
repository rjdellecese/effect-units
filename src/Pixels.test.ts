import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Pixels from "./Pixels";
import * as Quantity from "./Quantity";

describe("Pixels", () => {
  const testRoundtrip = <Q>(
    there: (n: number) => Q,
    back: (q: Q) => number,
  ) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  };

  testRoundtrip(Pixels.pixels, Pixels.inPixels);
  testRoundtrip(Pixels.pixelsPerSecond, Pixels.inPixelsPerSecond);
  testRoundtrip(
    Pixels.pixelsPerSecondSquared,
    Pixels.inPixelsPerSecondSquared,
  );
  testRoundtrip(Pixels.squarePixels, Pixels.inSquarePixels);

  it("pixels per second is pixels per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Pixels.pixels(10), Duration.seconds(2)),
        Pixels.pixelsPerSecond(5),
      ),
    );
  });

  it("square pixels is the product of two pixel quantities", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.times(Pixels.pixels(3), Pixels.pixels(4)),
        Pixels.squarePixels(12),
      ),
    );
  });
});
