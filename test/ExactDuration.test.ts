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
    [ExactDuration.milliseconds, Rational.unsafeMake(1n, 1000n)],
    [ExactDuration.minutes, Rational.unsafeMake(60n)],
    [ExactDuration.hours, Rational.unsafeMake(3600n)],
    [ExactDuration.days, Rational.unsafeMake(86400n)],
    [ExactDuration.weeks, Rational.unsafeMake(604800n)],
    [ExactDuration.julianYears, Rational.unsafeMake(31557600n)],
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
          Rational.unsafeMake(1n, 1_000_000_000n),
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
      const third = ExactDuration.seconds(Rational.unsafeMake(1n, 3n));

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
          ExactDuration.toDuration(
            ExactDuration.seconds(Rational.unsafeMake(-1n)),
          ),
        ),
      );
    });

    it("between measures the signed difference exactly", () => {
      const start = DateTime.unsafeMake(1000);
      const end = DateTime.unsafeMake(91_000);

      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(ExactDuration.between(start, end)),
          Rational.unsafeMake(90n),
        ),
      );
      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(ExactDuration.between(end, start)),
          Rational.unsafeMake(-90n),
        ),
      );
    });

    it("between stays exact across spans wider than 2^53 milliseconds", () => {
      // Subtracting the endpoints as doubles first would round this span up
      // to a whole number of seconds.
      const start = DateTime.unsafeMake(-8_640_000_000_000_000);
      const end = DateTime.unsafeMake(8_639_999_999_999_999);

      assertTrue(
        Equal.equals(
          ExactDuration.inSeconds(ExactDuration.between(start, end)),
          Rational.unsafeMake(17_279_999_999_999_999n, 1000n),
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
              ExactDuration.seconds(Rational.unsafeMake(3n, 2n)),
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
              ExactDuration.seconds(Rational.unsafeMake(-3n, 2n)),
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
              ExactDuration.seconds(Rational.unsafeMake(1n, 3n)),
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
            ExactDuration.days(Rational.unsafeMake(10n ** 12n)),
          ),
        ),
      );
      // The boundary itself is representable; one millisecond past it is not.
      assertTrue(
        Option.isSome(
          ExactDuration.addTo(
            start,
            ExactDuration.milliseconds(
              Rational.unsafeMake(8_640_000_000_000_000n),
            ),
          ),
        ),
      );
      assertTrue(
        Option.isNone(
          ExactDuration.addTo(
            start,
            ExactDuration.milliseconds(
              Rational.unsafeMake(8_640_000_000_000_001n),
            ),
          ),
        ),
      );
    });

    it("addTo is none, not a throw, for out-of-range zoned results", () => {
      // A named zone resolves through Intl, which throws on an out-of-range
      // instant rather than yielding a NaN epoch a guard could inspect
      // afterwards — so the range check has to come before construction.
      const zoned = DateTime.setZone(
        DateTime.unsafeMake(0),
        DateTime.zoneUnsafeMakeNamed("America/New_York"),
      );

      assertTrue(
        Option.isNone(
          ExactDuration.addTo(
            zoned,
            ExactDuration.days(Rational.unsafeMake(10n ** 12n)),
          ),
        ),
      );
    });

    it("addTo preserves the time zone of its input", () => {
      const zone = DateTime.zoneUnsafeMakeNamed("America/New_York");
      const zoned = DateTime.setZone(DateTime.unsafeMake(0), zone);
      const shifted = Option.getOrThrow(
        ExactDuration.addTo(
          zoned,
          ExactDuration.seconds(Rational.unsafeMake(90n)),
        ),
      );

      assertTrue(DateTime.isZoned(shifted));
      assertEquals(DateTime.toEpochMillis(shifted), 90_000);
    });

    it("addTo does not re-round offsets beyond 2^53 milliseconds", () => {
      // The offset exceeds Number.MAX_SAFE_INTEGER, so narrowing it before
      // the addition would land one millisecond short of the exact result.
      const start = DateTime.unsafeMake(-8_640_000_000_000_000);
      const offset = 10_000_000_000_000_001n;

      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            ExactDuration.addTo(
              start,
              ExactDuration.milliseconds(Rational.unsafeMake(offset)),
            ),
          ),
        ),
        Number(-8_640_000_000_000_000n + offset),
      );
    });
  });
});
