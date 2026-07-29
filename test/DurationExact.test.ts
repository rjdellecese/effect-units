import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as Duration from "../src/Duration.ts";
import * as DurationExact from "../src/DurationExact.ts";
import * as Rational from "../src/Rational.ts";

describe("DurationExact", () => {
  testExactRoundtrips([
    [DurationExact.seconds, DurationExact.inSeconds],
    [DurationExact.milliseconds, DurationExact.inMilliseconds],
    [DurationExact.minutes, DurationExact.inMinutes],
    [DurationExact.hours, DurationExact.inHours],
    [DurationExact.days, DurationExact.inDays],
    [DurationExact.weeks, DurationExact.inWeeks],
    [DurationExact.julianYears, DurationExact.inJulianYears],
  ]);

  testExactAnchors(DurationExact.inSeconds, [
    [DurationExact.milliseconds, Rational.makeUnsafe(1n, 1000n)],
    [DurationExact.minutes, Rational.makeUnsafe(60n)],
    [DurationExact.hours, Rational.makeUnsafe(3600n)],
    [DurationExact.days, Rational.makeUnsafe(86400n)],
    [DurationExact.weeks, Rational.makeUnsafe(604800n)],
    [DurationExact.julianYears, Rational.makeUnsafe(31557600n)],
  ]);

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [DurationExact.milliseconds, Duration.milliseconds],
      [DurationExact.minutes, Duration.minutes],
      [DurationExact.hours, Duration.hours],
      [DurationExact.days, Duration.days],
      [DurationExact.weeks, Duration.weeks],
      [DurationExact.julianYears, Duration.julianYears],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });

  describe("interop", () => {
    it("fromDuration is exact down to the nanosecond", () => {
      const duration = DurationExact.fromDuration(EffectDuration.nanos(1n));

      assertTrue(Option.isSome(duration));
      assertTrue(
        Equal.equals(
          DurationExact.inSeconds(Option.getOrThrow(duration)),
          Rational.makeUnsafe(1n, 1_000_000_000n),
        ),
      );
    });

    it("fromDuration is none for infinite durations", () => {
      assertTrue(
        Option.isNone(DurationExact.fromDuration(EffectDuration.infinity)),
      );
    });

    it("roundtrips through effect/Duration exactly", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.bigInt({ min: 0n, max: 2n ** 63n }),
          (nanos) => {
            const duration = Option.getOrThrow(
              DurationExact.fromDuration(EffectDuration.nanos(nanos)),
            );
            const back = Option.getOrThrow(DurationExact.toDuration(duration));

            assertEquals(
              Option.getOrThrow(EffectDuration.toNanos(back)),
              nanos,
            );
          },
        ),
      );
    });

    it("toDuration rounds to nanoseconds under the given mode", () => {
      const third = DurationExact.seconds(Rational.makeUnsafe(1n, 3n));

      assertEquals(
        Option.getOrThrow(
          EffectDuration.toNanos(
            Option.getOrThrow(DurationExact.toDuration(third)),
          ),
        ),
        333_333_333n,
      );
      assertEquals(
        Option.getOrThrow(
          EffectDuration.toNanos(
            Option.getOrThrow(
              DurationExact.toDuration(third, { mode: "ceil" }),
            ),
          ),
        ),
        333_333_334n,
      );
    });

    it("toDuration is none for negative durations", () => {
      assertTrue(
        Option.isNone(
          DurationExact.toDuration(
            DurationExact.seconds(Rational.makeUnsafe(-1n)),
          ),
        ),
      );
    });

    it("between measures the signed difference exactly", () => {
      const start = DateTime.makeUnsafe(1000);
      const end = DateTime.makeUnsafe(91_000);

      assertTrue(
        Equal.equals(
          DurationExact.inSeconds(DurationExact.between(start, end)),
          Rational.makeUnsafe(90n),
        ),
      );
      assertTrue(
        Equal.equals(
          DurationExact.inSeconds(DurationExact.between(end, start)),
          Rational.makeUnsafe(-90n),
        ),
      );
    });

    it("between stays exact across spans wider than 2^53 milliseconds", () => {
      // Subtracting the endpoints as doubles first would round this span up
      // to a whole number of seconds.
      const start = DateTime.makeUnsafe(-8_640_000_000_000_000);
      const end = DateTime.makeUnsafe(8_639_999_999_999_999);

      assertTrue(
        Equal.equals(
          DurationExact.inSeconds(DurationExact.between(start, end)),
          Rational.makeUnsafe(17_279_999_999_999_999n, 1000n),
        ),
      );
    });

    it("addTo adds to a DateTime, rounding to milliseconds", () => {
      const start = DateTime.makeUnsafe(0);

      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            DurationExact.addTo(
              start,
              DurationExact.seconds(Rational.makeUnsafe(3n, 2n)),
            ),
          ),
        ),
        1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            DurationExact.addTo(
              start,
              DurationExact.seconds(Rational.makeUnsafe(-3n, 2n)),
            ),
          ),
        ),
        -1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            DurationExact.addTo(
              start,
              DurationExact.seconds(Rational.makeUnsafe(1n, 3n)),
              { mode: "ceil" },
            ),
          ),
        ),
        334,
      );
    });

    it("addTo is none for out-of-range results", () => {
      const start = DateTime.makeUnsafe(0);

      // Exact, but lands outside the representable DateTime range.
      assertTrue(
        Option.isNone(
          DurationExact.addTo(
            start,
            DurationExact.days(Rational.makeUnsafe(10n ** 12n)),
          ),
        ),
      );
      // The boundary itself is representable; one millisecond past it is not.
      assertTrue(
        Option.isSome(
          DurationExact.addTo(
            start,
            DurationExact.milliseconds(
              Rational.makeUnsafe(8_640_000_000_000_000n),
            ),
          ),
        ),
      );
      assertTrue(
        Option.isNone(
          DurationExact.addTo(
            start,
            DurationExact.milliseconds(
              Rational.makeUnsafe(8_640_000_000_000_001n),
            ),
          ),
        ),
      );
    });

    it("addTo is none, not a throw, for out-of-range zoned results", () => {
      // A named zone resolves through Intl, which throws on an out-of-range
      // instant rather than yielding a NaN epoch a guard could inspect
      // afterwards—so the range check has to come before construction.
      const zoned = DateTime.setZone(
        DateTime.makeUnsafe(0),
        DateTime.zoneMakeNamedUnsafe("America/New_York"),
      );

      assertTrue(
        Option.isNone(
          DurationExact.addTo(
            zoned,
            DurationExact.days(Rational.makeUnsafe(10n ** 12n)),
          ),
        ),
      );
    });

    it("addTo preserves the time zone of its input", () => {
      const zone = DateTime.zoneMakeNamedUnsafe("America/New_York");
      const zoned = DateTime.setZone(DateTime.makeUnsafe(0), zone);
      const shifted = Option.getOrThrow(
        DurationExact.addTo(
          zoned,
          DurationExact.seconds(Rational.makeUnsafe(90n)),
        ),
      );

      assertTrue(DateTime.isZoned(shifted));
      assertEquals(DateTime.toEpochMillis(shifted), 90_000);
    });

    it("addTo does not re-round offsets beyond 2^53 milliseconds", () => {
      // The offset exceeds Number.MAX_SAFE_INTEGER, so narrowing it before
      // the addition would land one millisecond short of the exact result.
      const start = DateTime.makeUnsafe(-8_640_000_000_000_000);
      const offset = 10_000_000_000_000_001n;

      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(
            DurationExact.addTo(
              start,
              DurationExact.milliseconds(Rational.makeUnsafe(offset)),
            ),
          ),
        ),
        Number(-8_640_000_000_000_000n + offset),
      );
    });
  });
});
