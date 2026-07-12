import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";

import * as Duration from "./Duration";
import { closeTo, double } from "./internal/testUtils";

describe("Duration", () => {
  const roundtrip = [
    { there: Duration.seconds, back: Duration.inSeconds },
    { there: Duration.milliseconds, back: Duration.inMilliseconds },
    { there: Duration.minutes, back: Duration.inMinutes },
    { there: Duration.hours, back: Duration.inHours },
    { there: Duration.days, back: Duration.inDays },
    { there: Duration.weeks, back: Duration.inWeeks },
    { there: Duration.julianYears, back: Duration.inJulianYears },
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

  describe("interop", () => {
    it("roundtrips through effect/Duration", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.integer({ min: 0, max: 2 ** 48 }),
          (millis) => {
            const duration = Duration.fromDuration(
              EffectDuration.millis(millis),
            );
            const back = Duration.toDuration(duration).pipe(
              Option.getOrThrow,
            );

            assertTrue(closeTo(EffectDuration.toMillis(back), millis, 1e-12));
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

    it("toDuration is none for negative or non-finite durations", () => {
      assertTrue(Option.isNone(Duration.toDuration(Duration.seconds(-1))));
      assertTrue(
        Option.isNone(Duration.toDuration(Duration.seconds(Infinity))),
      );
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
        DateTime.toEpochMillis(Duration.addTo(start, Duration.seconds(1.5))),
        1500,
      );
      assertEquals(
        DateTime.toEpochMillis(Duration.addTo(start, Duration.seconds(-1.5))),
        -1500,
      );
    });
  });
});
