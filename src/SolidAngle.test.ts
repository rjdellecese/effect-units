import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Angle from "./Angle";
import { pi } from "./internal/constants";
import * as SolidAngle from "./SolidAngle";

const closeTo = (
  a: BigDecimal.BigDecimal,
  b: BigDecimal.BigDecimal,
  tolerance = BigDecimal.make(1n, 12),
) => BigDecimal.lessThan(BigDecimal.abs(BigDecimal.subtract(a, b)), tolerance);

describe("SolidAngle", () => {
  const roundtrip = [
    { there: SolidAngle.steradians, back: SolidAngle.inSteradians },
    { there: SolidAngle.spats, back: SolidAngle.inSpats },
    { there: SolidAngle.squareDegrees, back: SolidAngle.inSquareDegrees },
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

  it("one spat is 4π steradians", () => {
    assertEquals(
      SolidAngle.inSteradians(SolidAngle.spats(BigDecimal.fromBigInt(1n))),
      BigDecimal.multiply(pi, BigDecimal.fromBigInt(4n)),
    );
  });

  it("a full-sphere cone is one spat", () => {
    // A cone with apex angle 2π (a full turn) covers the whole sphere.
    assertTrue(
      closeTo(
        SolidAngle.inSpats(
          SolidAngle.conical(Angle.turns(BigDecimal.fromBigInt(1n))),
        ),
        BigDecimal.fromBigInt(1n),
      ),
    );
  });

  it("a right-angled cone matches the closed form", () => {
    // 2π(1 - cos(45°)) ≈ 1.840302369021...
    assertTrue(
      closeTo(
        SolidAngle.inSteradians(
          SolidAngle.conical(Angle.degrees(BigDecimal.fromBigInt(90n))),
        ),
        BigDecimal.unsafeFromNumber(2 * Math.PI * (1 - Math.cos(Math.PI / 4))),
      ),
    );
  });

  it("a right-angled square pyramid matches the closed form", () => {
    // 4·asin(sin²(45°)) = 4·asin(1/2) = 2π/3
    assertTrue(
      closeTo(
        SolidAngle.inSteradians(
          SolidAngle.pyramidal(
            Angle.degrees(BigDecimal.fromBigInt(90n)),
            Angle.degrees(BigDecimal.fromBigInt(90n)),
          ),
        ),
        BigDecimal.unsafeFromNumber((2 * Math.PI) / 3),
      ),
    );
  });
});
