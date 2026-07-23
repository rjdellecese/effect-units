import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as Duration from "../src/Duration.ts";
import * as ExactDuration from "../src/ExactDuration.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactDuration", () => {
  testExactRoundtrips([
    [ExactDuration.seconds, ExactDuration.inSeconds],
    [ExactDuration.milliseconds, ExactDuration.inMilliseconds],
    [ExactDuration.minutes, ExactDuration.inMinutes],
    [ExactDuration.hours, ExactDuration.inHours],
    [ExactDuration.days, ExactDuration.inDays],
    [ExactDuration.weeks, ExactDuration.inWeeks],
    [ExactDuration.julianYears, ExactDuration.inJulianYears],
  ]);

  testExactAnchors(ExactDuration.inSeconds, [
    [ExactDuration.milliseconds, Rational.make(1n, 1000n)],
    [ExactDuration.minutes, Rational.make(60n)],
    [ExactDuration.hours, Rational.make(3600n)],
    [ExactDuration.days, Rational.make(86400n)],
    [ExactDuration.weeks, Rational.make(604800n)],
    [ExactDuration.julianYears, Rational.make(31557600n)],
  ]);

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [ExactDuration.milliseconds, Duration.milliseconds],
      [ExactDuration.minutes, Duration.minutes],
      [ExactDuration.hours, Duration.hours],
      [ExactDuration.days, Duration.days],
      [ExactDuration.weeks, Duration.weeks],
      [ExactDuration.julianYears, Duration.julianYears],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });

  describe("interop", () => {
    it("fromDuration is exact down to the nanosecond", () => {
      const duration = ExactDuration.fromDuration(EffectDuration.nanos(1n));

      assertTrue(Option.isSome(duration));
      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(Option.getOrThrow(duration)),
          Rational.make(1n, 1_000_000_000n),
        ),
      );
    });

    it("fromDuration is none for infinite durations", () => {
      assertTrue(
        Option.isNone(ExactDuration.fromDuration(EffectDuration.infinity)),
      );
    });

    it("roundtrips through effect/Duration exactly", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.bigInt({ min: 0n, max: 2n ** 63n }),
          (nanos) => {
            const duration = Option.getOrThrow(
              ExactDuration.fromDuration(EffectDuration.nanos(nanos)),
            );
            const back = Option.getOrThrow(ExactDuration.toDuration(duration));

            assertEquals(
              Option.getOrThrow(EffectDuration.toNanos(back)),
              nanos,
            );
          },
        ),
      );
    });

    it("toDuration rounds to nanoseconds under the given mode", () => {
      const third = ExactDuration.seconds(Rational.make(1n, 3n));

      assertEquals(
        Option.getOrThrow(
          EffectDuration.toNanos(
            Option.getOrThrow(ExactDuration.toDuration(third)),
          ),
        ),
        333_333_333n,
      );
      assertEquals(
        Option.getOrThrow(
          EffectDuration.toNanos(
            Option.getOrThrow(
              ExactDuration.toDuration(third, { mode: "ceil" }),
            ),
          ),
        ),
        333_333_334n,
      );
    });

    it("toDuration is none for negative durations", () => {
      assertTrue(
        Option.isNone(
          ExactDuration.toDuration(ExactDuration.seconds(Rational.make(-1n))),
        ),
      );
    });

    it("between measures the signed difference exactly", () => {
      const start = DateTime.unsafeMake(1000);
      const end = DateTime.unsafeMake(91_000);

      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(ExactDuration.between(start, end)),
          Rational.make(90n),
        ),
      );
      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(ExactDuration.between(end, start)),
          Rational.make(-90n),
        ),
      );
    });

    it("addTo adds to a DateTime, rounding to milliseconds", () => {
      const start = DateTime.unsafeMake(0);

      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            ExactDuration.addTo(
              start,
              ExactDuration.seconds(Rational.make(3n, 2n)),
            ),
          ),
        ),
        1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            ExactDuration.addTo(
              start,
              ExactDuration.seconds(Rational.make(-3n, 2n)),
            ),
          ),
        ),
        -1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            ExactDuration.addTo(
              start,
              ExactDuration.seconds(Rational.make(1n, 3n)),
              { mode: "ceil" },
            ),
          ),
        ),
        334,
      );
    });

    it("addTo is none for out-of-range results", () => {
      const start = DateTime.unsafeMake(0);

      // Exact, but lands outside the representable DateTime range.
      assertTrue(
        Option.isNone(
          ExactDuration.addTo(
            start,
            ExactDuration.days(Rational.make(10n ** 12n)),
          ),
        ),
      );
    });
  });
});
