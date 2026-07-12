import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Duration from "./Duration";

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
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  describe("interop", () => {
    it("roundtrips through effect/Duration for whole nanoseconds", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.bigInt({ min: 0n, max: 2n ** 63n }),
          (nanos) => {
            const duration = Duration.fromDuration(
              EffectDuration.nanos(nanos),
            ).pipe(Option.getOrThrow);
            const back = Duration.toDuration(duration).pipe(Option.getOrThrow);

            assertTrue(Equal.equals(back, EffectDuration.nanos(nanos)));
          },
        ),
      );
    });

    it("toDuration is none for negative durations", () => {
      assertTrue(
        Option.isNone(
          Duration.toDuration(
            Duration.seconds(BigDecimal.fromBigInt(-1n)),
          ),
        ),
      );
    });

    it("toDuration is none for sub-nanosecond durations", () => {
      assertTrue(
        Option.isNone(
          Duration.toDuration(Duration.seconds(BigDecimal.make(1n, 10))),
        ),
      );
    });

    it("between measures the signed difference between DateTimes", () => {
      const start = DateTime.unsafeMake(1000);
      const end = DateTime.unsafeMake(91_000);

      assertTrue(
        Equal.equals(
          Duration.between(start, end),
          Duration.seconds(BigDecimal.fromBigInt(90n)),
        ),
      );
      assertTrue(
        Equal.equals(
          Duration.between(end, start),
          Duration.seconds(BigDecimal.fromBigInt(-90n)),
        ),
      );
    });

    it("addTo adds to a DateTime, rounding to milliseconds", () => {
      const start = DateTime.unsafeMake(0);

      assertEquals(
        DateTime.toEpochMillis(
          Duration.addTo(start, Duration.seconds(BigDecimal.make(15n, 1))),
        ),
        1500,
      );
      assertEquals(
        DateTime.toEpochMillis(
          Duration.addTo(start, Duration.seconds(BigDecimal.make(-15n, 1))),
        ),
        -1500,
      );
    });
  });
});
