import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Angle from "./Angle";
import { pi } from "./internal/constants";

const bigDecimal = Arbitrary.make(Schema.BigDecimal);

const closeTo = (
  a: BigDecimal.BigDecimal,
  b: BigDecimal.BigDecimal,
  tolerance = BigDecimal.make(1n, 12),
) => BigDecimal.lessThan(BigDecimal.abs(BigDecimal.subtract(a, b)), tolerance);

describe("Angle", () => {
  const roundtrip = [
    { there: Angle.radians, back: Angle.inRadians },
    { there: Angle.degrees, back: Angle.inDegrees },
    { there: Angle.turns, back: Angle.inTurns },
    { there: Angle.minutes, back: Angle.inMinutes },
    { there: Angle.seconds, back: Angle.inSeconds },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(bigDecimal, (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  // Cross-unit identities hold only to the precision of the independently
  // rounded π-derived factors (~100 significant digits), while same-unit
  // roundtrips are exact.
  it("relates degrees to turns to ~100 digits", () => {
    assertTrue(
      closeTo(
        Angle.inTurns(Angle.degrees(BigDecimal.fromBigInt(360n))),
        BigDecimal.fromBigInt(1n),
        BigDecimal.make(1n, 95),
      ),
    );
  });

  describe("dms", () => {
    it("roundtrips through fromDms and toDms", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.constantFrom<Angle.Sign>("Positive", "Negative"),
          FastCheck.bigInt({ min: 0n, max: 1000n }),
          FastCheck.bigInt({ min: 0n, max: 59n }),
          FastCheck.bigInt({ min: 0n, max: 59_999n }),
          (sign, degrees, minutes, milliarcseconds) => {
            const seconds = BigDecimal.make(milliarcseconds, 3);
            const dms = Angle.toDms(
              Angle.fromDms({ sign, degrees, minutes, seconds }),
            );

            // The all-zero angle normalizes to a Positive sign.
            const expectedSign =
              degrees === 0n &&
              minutes === 0n &&
              milliarcseconds === 0n
                ? "Positive"
                : sign;

            assertEquals(dms.sign, expectedSign);
            assertEquals(dms.degrees, degrees);
            assertEquals(dms.minutes, minutes);
            assertEquals(dms.seconds, seconds);
          },
        ),
      );
    });
  });

  describe("trigonometry", () => {
    it("sin of 90 degrees is 1", () => {
      assertTrue(
        closeTo(
          Angle.sin(Angle.degrees(BigDecimal.fromBigInt(90n))),
          BigDecimal.fromBigInt(1n),
        ),
      );
    });

    it("cos of one turn is 1", () => {
      assertTrue(
        closeTo(
          Angle.cos(Angle.turns(BigDecimal.fromBigInt(1n))),
          BigDecimal.fromBigInt(1n),
        ),
      );
    });

    it("tan of 45 degrees is 1", () => {
      assertTrue(
        closeTo(
          Angle.tan(Angle.degrees(BigDecimal.fromBigInt(45n))),
          BigDecimal.fromBigInt(1n),
        ),
      );
    });

    it("atan2(1, 1) is 45 degrees", () => {
      assertTrue(
        closeTo(
          Angle.inDegrees(
            Angle.atan2(BigDecimal.fromBigInt(1n), BigDecimal.fromBigInt(1n)),
          ),
          BigDecimal.fromBigInt(45n),
        ),
      );
    });

    it("asin is none outside [-1, 1]", () => {
      assertTrue(Option.isNone(Angle.asin(BigDecimal.fromBigInt(2n))));
      assertTrue(Option.isNone(Angle.acos(BigDecimal.fromBigInt(-2n))));
    });

    it("asin(1) is 90 degrees", () => {
      assertTrue(
        closeTo(
          Angle.inDegrees(
            Option.getOrThrow(Angle.asin(BigDecimal.fromBigInt(1n))),
          ),
          BigDecimal.fromBigInt(90n),
        ),
      );
    });
  });

  describe("normalize", () => {
    it("returns a value in (-π, π] differing by a whole number of turns", () => {
      const twoPi = BigDecimal.multiply(pi, BigDecimal.fromBigInt(2n));

      FastCheck.assert(
        FastCheck.property(bigDecimal, (n) => {
          const angle = Angle.radians(n);
          const normalized = Angle.normalize(angle);

          assertTrue(BigDecimal.lessThanOrEqualTo(normalized.value, pi));
          assertTrue(
            BigDecimal.greaterThan(normalized.value, BigDecimal.negate(pi)),
          );

          const difference = BigDecimal.subtract(n, normalized.value);
          assertTrue(
            BigDecimal.isZero(
              BigDecimal.normalize(
                BigDecimal.unsafeRemainder(difference, twoPi),
              ),
            ),
          );
        }),
      );
    });

    it("normalizes 3 half-turns to half a turn", () => {
      assertEquals(
        Angle.normalize(
          Angle.turns(BigDecimal.make(15n, 1)),
        ).value,
        pi,
      );
    });
  });
});
