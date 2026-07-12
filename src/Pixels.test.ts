import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Duration from "./Duration";
import * as Pixels from "./Pixels";
import * as Quantity from "./Quantity";

describe("Pixels", () => {
  const roundtrip = [
    { there: Pixels.pixels, back: Pixels.inPixels },
    { there: Pixels.pixelsPerSecond, back: Pixels.inPixelsPerSecond },
    {
      there: Pixels.pixelsPerSecondSquared,
      back: Pixels.inPixelsPerSecondSquared,
    },
    { there: Pixels.squarePixels, back: Pixels.inSquarePixels },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("pixels per second is pixels per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Pixels.pixels(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Pixels.pixelsPerSecond(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("square pixels is the product of two pixel quantities", () => {
    assertTrue(
      Equal.equals(
        Quantity.times(
          Pixels.pixels(BigDecimal.fromBigInt(3n)),
          Pixels.pixels(BigDecimal.fromBigInt(4n)),
        ),
        Pixels.squarePixels(BigDecimal.fromBigInt(12n)),
      ),
    );
  });
});
