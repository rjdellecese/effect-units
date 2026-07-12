import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Angle from "./Angle";
import { closeTo, double } from "./internal/testUtils";

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
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("relates degrees to turns", () => {
    assertTrue(closeTo(Angle.inTurns(Angle.degrees(360)), 1));
  });

  describe("dms", () => {
    it("roundtrips through toDms and fromDms", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.double({ min: -1e6, max: 1e6, noNaN: true }),
          (n) => {
            const angle = Angle.radians(n);
            const reconstructed = Angle.fromDms(Angle.toDms(angle));

            assertTrue(closeTo(reconstructed.value, n, 1e-6));
          },
        ),
      );
    });

    it("produces parts in range", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.double({ min: -1e6, max: 1e6, noNaN: true }),
          (n) => {
            const dms = Angle.toDms(Angle.radians(n));

            assertTrue(dms.degrees >= 0);
            assertTrue(dms.minutes >= 0 && dms.minutes < 60);
            assertTrue(dms.seconds >= 0 && dms.seconds < 60);
          },
        ),
      );
    });

    it("converts a known value", () => {
      const angle = Angle.fromDms({
        sign: "Positive",
        degrees: 30,
        minutes: 30,
        seconds: 0,
      });

      assertTrue(closeTo(Angle.inDegrees(angle), 30.5));

      const dms = Angle.toDms(Angle.degrees(-10.25));
      assertEquals(dms.sign, "Negative");
      assertEquals(dms.degrees, 10);
      assertEquals(dms.minutes, 15);
      assertTrue(closeTo(dms.seconds, 0, 1e-6) || dms.seconds < 1e-6);
    });
  });

  describe("trigonometry", () => {
    it("sin of 90 degrees is 1", () => {
      assertTrue(closeTo(Angle.sin(Angle.degrees(90)), 1));
    });

    it("cos of one turn is 1", () => {
      assertTrue(closeTo(Angle.cos(Angle.turns(1)), 1));
    });

    it("tan of 45 degrees is 1", () => {
      assertTrue(closeTo(Angle.tan(Angle.degrees(45)), 1));
    });

    it("atan2(1, 1) is 45 degrees", () => {
      assertTrue(closeTo(Angle.inDegrees(Angle.atan2(1, 1)), 45));
    });

    it("asin is NaN outside [-1, 1]", () => {
      assertTrue(Number.isNaN(Angle.inRadians(Angle.asin(2))));
      assertTrue(Number.isNaN(Angle.inRadians(Angle.acos(-2))));
    });

    it("asin(1) is 90 degrees", () => {
      assertTrue(closeTo(Angle.inDegrees(Angle.asin(1)), 90));
    });
  });

  describe("normalize", () => {
    it("returns a value in (-π, π] differing by a whole number of turns", () => {
      const twoPi = 2 * Math.PI;

      FastCheck.assert(
        FastCheck.property(
          FastCheck.double({ min: -1e6, max: 1e6, noNaN: true }),
          (n) => {
            const normalized = Angle.normalize(Angle.radians(n));

            assertTrue(normalized.value <= Math.PI);
            assertTrue(normalized.value > -Math.PI - 1e-9);

            const remainder = Math.abs((n - normalized.value) % twoPi);
            assertTrue(remainder < 1e-6 || Math.abs(remainder - twoPi) < 1e-6);
          },
        ),
      );
    });

    it("normalizes 1.5 turns to half a turn", () => {
      assertTrue(
        closeTo(Math.abs(Angle.normalize(Angle.turns(1.5)).value), Math.PI),
      );
    });
  });
});
