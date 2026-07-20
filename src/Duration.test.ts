import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as FastCheck from "effect/FastCheck";
import * as Option from "effect/Option";

import * as Duration from "./Duration.ts";
import { isCloseTo, testAnchors, testRoundtrips } from "../test/testUtils.ts";

describe("Duration", () => {
  testRoundtrips([
    [Duration.seconds, Duration.inSeconds],
    [Duration.milliseconds, Duration.inMilliseconds],
    [Duration.minutes, Duration.inMinutes],
    [Duration.hours, Duration.inHours],
    [Duration.days, Duration.inDays],
    [Duration.weeks, Duration.inWeeks],
    [Duration.julianYears, Duration.inJulianYears],
  ]);

  testAnchors(Duration.inSeconds, [
    [Duration.milliseconds, 1e-3],
    [Duration.minutes, 60],
    [Duration.hours, 3600],
    [Duration.days, 86400],
    [Duration.weeks, 604800],
    [Duration.julianYears, 31557600],
  ]);

  describe("interop", () => {
    it("roundtrips through effect/Duration", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.integer({ min: 0, max: 2 ** 48 }),
          (millis) => {
            const duration = Duration.fromDuration(
              EffectDuration.millis(millis),
            );
            const back = Duration.toDuration(duration).pipe(Option.getOrThrow);

            assertTrue(
              isCloseTo(EffectDuration.toMillis(back), millis, {
                relativeTolerance: 1e-12,
              }),
            );
          },
        ),
      );
    });

    it("fromDuration converts infinite durations to Infinity", () => {
      assertEquals(
        Duration.inSeconds(Duration.fromDuration(EffectDuration.infinity)),
        Infinity,
      );
    });

    it("toDuration is none for negative, non-finite, or oversized durations", () => {
      assertTrue(Option.isNone(Duration.toDuration(Duration.seconds(-1))));
      assertTrue(
        Option.isNone(Duration.toDuration(Duration.seconds(Infinity))),
      );
      // Finite, but the nanosecond count overflows the float range.
      assertTrue(Option.isNone(Duration.toDuration(Duration.seconds(1e300))));
    });

    it("between measures the signed difference between DateTimes", () => {
      const start = DateTime.unsafeMake(1000);
      const end = DateTime.unsafeMake(91_000);

      assertEquals(Duration.inSeconds(Duration.between(start, end)), 90);
      assertEquals(Duration.inSeconds(Duration.between(end, start)), -90);
    });

    it("addTo adds to a DateTime, rounding to milliseconds", () => {
      const start = DateTime.unsafeMake(0);

      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(Duration.addTo(start, Duration.seconds(1.5))),
        ),
        1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Option.getOrThrow(Duration.addTo(start, Duration.seconds(-1.5))),
        ),
        -1500,
      );
    });

    it("addTo is none for non-finite or out-of-range results", () => {
      const start = DateTime.unsafeMake(0);

      assertTrue(
        Option.isNone(Duration.addTo(start, Duration.seconds(Infinity))),
      );
      // Finite, but lands outside the representable DateTime range.
      assertTrue(Option.isNone(Duration.addTo(start, Duration.days(1e12))));
    });
  });
});
