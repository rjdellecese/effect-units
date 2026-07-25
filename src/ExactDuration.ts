import type * as BigDecimal from "effect/BigDecimal";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Option from "effect/Option";

import * as Duration from "./Duration.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactDuration = ExactQuantity.ExactQuantity<Duration.Seconds>;

export const ExactDuration = ExactQuantity.ExactQuantity(Duration.Seconds);
export const ExactDurationFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Duration.Seconds,
);

const make = (value: Rational.Rational): ExactDuration =>
  ExactQuantity.make(Duration.Seconds, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const seconds = (r: Rational.Rational) => make(r);

export const inSeconds = (d: ExactDuration) => d.value;

export const milliseconds = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Milli", r));

export const inMilliseconds = (d: ExactDuration) =>
  ExactPrefix.toPrefixed("Milli", d.value);

export const minutes = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.secondsPerMinute));

export const inMinutes = (d: ExactDuration) =>
  Rational.unsafeDivide(d.value, ExactConstants.secondsPerMinute);

export const hours = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.secondsPerHour));

export const inHours = (d: ExactDuration) =>
  Rational.unsafeDivide(d.value, ExactConstants.secondsPerHour);

const secondsPerDay = Rational.multiply(
  Rational.unsafeMake(24n),
  ExactConstants.secondsPerHour,
);

export const days = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerDay));

export const inDays = (d: ExactDuration) =>
  Rational.unsafeDivide(d.value, secondsPerDay);

const secondsPerWeek = Rational.multiply(
  Rational.unsafeMake(7n),
  secondsPerDay,
);

export const weeks = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerWeek));

export const inWeeks = (d: ExactDuration) =>
  Rational.unsafeDivide(d.value, secondsPerWeek);

/** One Julian year is exactly 365.25 days. */
const secondsPerJulianYear = Rational.multiply(
  Rational.unsafeMake(1461n, 4n),
  secondsPerDay,
);

export const julianYears = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerJulianYear));

export const inJulianYears = (d: ExactDuration) =>
  Rational.unsafeDivide(d.value, secondsPerJulianYear);

// Interop

const nanosecondsPerSecond = Rational.unsafeMake(1_000_000_000n);

const millisecondsPerSecond = Rational.unsafeMake(1000n);

/**
 * Converts an `effect/Duration` to an `ExactDuration` — lossless, since a
 * whole number of nanoseconds is an exact rational number of seconds.
 * Returns `Option.none()` for infinite durations, which have no rational
 * image.
 */
export const fromDuration = (
  duration: EffectDuration.Duration,
): Option.Option<ExactDuration> =>
  Option.map(EffectDuration.toNanos(duration), (nanos) =>
    make(Rational.unsafeMake(nanos, 1_000_000_000n)),
  );

/**
 * Converts an `ExactDuration` to an `effect/Duration`, rounding to a whole
 * number of nanoseconds under the given mode — exactly one rounding, made
 * explicit. Returns `Option.none()` when the duration is negative
 * (`effect/Duration`s are non-negative).
 */
export const toDuration = (
  d: ExactDuration,
  options?: { readonly mode?: BigDecimal.RoundingMode },
): Option.Option<EffectDuration.Duration> =>
  Rational.isNegative(d.value)
    ? Option.none()
    : Option.some(
        EffectDuration.nanos(
          Rational.round(
            Rational.multiply(d.value, nanosecondsPerSecond),
            options,
          ),
        ),
      );

/**
 * The signed duration from `start` to `end` (negative when `end` is earlier
 * than `start`) — exact, since `DateTime`s are whole numbers of epoch
 * milliseconds.
 */
export const between = (
  start: DateTime.DateTime,
  end: DateTime.DateTime,
): ExactDuration =>
  make(
    Rational.unsafeMake(
      BigInt(DateTime.toEpochMillis(end) - DateTime.toEpochMillis(start)),
      1000n,
    ),
  );

/**
 * Adds a duration to a `DateTime`, rounding to a whole number of
 * milliseconds (the resolution of `DateTime`) under the given mode —
 * exactly one rounding, made explicit. Returns `Option.none()` when the
 * result falls outside the representable `DateTime` range.
 */
export const addTo = (
  dateTime: DateTime.DateTime,
  d: ExactDuration,
  options?: { readonly mode?: BigDecimal.RoundingMode },
): Option.Option<DateTime.DateTime> => {
  const millis = Rational.round(
    Rational.multiply(d.value, millisecondsPerSecond),
    options,
  );

  const result = DateTime.add(dateTime, { millis: Number(millis) });

  return Number.isNaN(DateTime.toEpochMillis(result))
    ? Option.none()
    : Option.some(result);
};
