import type * as BigDecimal from "effect/BigDecimal";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Option from "effect/Option";

import * as Duration from "./Duration.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type DurationExact = QuantityExact.QuantityExact<Duration.Seconds>;

export const DurationExact = QuantityExact.QuantityExact(Duration.Seconds);
export const DurationExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Duration.Seconds,
);

const make = (value: Rational.Rational): DurationExact =>
  QuantityExact.make(Duration.Seconds, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const seconds = (r: Rational.Rational) => make(r);

export const inSeconds = (d: DurationExact) => d.value;

export const milliseconds = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Milli", r));

export const inMilliseconds = (d: DurationExact) =>
  PrefixExact.toPrefixed("Milli", d.value);

export const minutes = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.secondsPerMinute));

export const inMinutes = (d: DurationExact) =>
  Rational.unsafeDivide(d.value, ConstantsExact.secondsPerMinute);

export const hours = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.secondsPerHour));

export const inHours = (d: DurationExact) =>
  Rational.unsafeDivide(d.value, ConstantsExact.secondsPerHour);

const secondsPerDay = Rational.multiply(
  Rational.unsafeMake(24n),
  ConstantsExact.secondsPerHour,
);

export const days = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerDay));

export const inDays = (d: DurationExact) =>
  Rational.unsafeDivide(d.value, secondsPerDay);

const secondsPerWeek = Rational.multiply(
  Rational.unsafeMake(7n),
  secondsPerDay,
);

export const weeks = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerWeek));

export const inWeeks = (d: DurationExact) =>
  Rational.unsafeDivide(d.value, secondsPerWeek);

/** One Julian year is exactly 365.25 days. */
const secondsPerJulianYear = Rational.multiply(
  Rational.unsafeMake(1461n, 4n),
  secondsPerDay,
);

export const julianYears = (r: Rational.Rational) =>
  make(Rational.multiply(r, secondsPerJulianYear));

export const inJulianYears = (d: DurationExact) =>
  Rational.unsafeDivide(d.value, secondsPerJulianYear);

// Interop

const nanosecondsPerSecond = Rational.unsafeMake(1_000_000_000n);

const millisecondsPerSecond = Rational.unsafeMake(1000n);

/** The widest epoch millisecond a `Date`, and so a `DateTime`, can hold. */
const maxEpochMillis = 8_640_000_000_000_000n;

/**
 * Converts an `effect/Duration` to an `DurationExact`—lossless, since a
 * whole number of nanoseconds is an exact rational number of seconds.
 * Returns `Option.none()` for infinite durations, which have no rational
 * image.
 */
export const fromDuration = (
  duration: EffectDuration.Duration,
): Option.Option<DurationExact> =>
  Option.map(EffectDuration.toNanos(duration), (nanos) =>
    make(Rational.unsafeMake(nanos, 1_000_000_000n)),
  );

/**
 * Converts an `DurationExact` to an `effect/Duration`, rounding to a whole
 * number of nanoseconds under the given mode—exactly one rounding, made
 * explicit. Returns `Option.none()` when the duration is negative
 * (`effect/Duration`s are non-negative).
 */
export const toDuration = (
  d: DurationExact,
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
 * than `start`)—exact, since `DateTime`s are whole numbers of epoch
 * milliseconds.
 */
export const between = (
  start: DateTime.DateTime,
  end: DateTime.DateTime,
): DurationExact =>
  make(
    Rational.unsafeMake(
      // Each endpoint is a safe integer (|epochMillis| <= 8.64e15 < 2^53), so
      // widening before subtracting is exact—subtracting first would round
      // spans wider than 2^53 milliseconds.
      BigInt(DateTime.toEpochMillis(end)) -
        BigInt(DateTime.toEpochMillis(start)),
      1000n,
    ),
  );

/**
 * Adds a duration to a `DateTime`, rounding to a whole number of
 * milliseconds (the resolution of `DateTime`) under the given mode—
 * exactly one rounding, made explicit. Returns `Option.none()` when the
 * result falls outside the representable `DateTime` range.
 */
export const addTo = (
  dateTime: DateTime.DateTime,
  d: DurationExact,
  options?: { readonly mode?: BigDecimal.RoundingMode },
): Option.Option<DateTime.DateTime> => {
  const millis = Rational.round(
    Rational.multiply(d.value, millisecondsPerSecond),
    options,
  );
  // The offset stays a bigint through the addition and the range check:
  // narrowing it first would re-round offsets beyond 2^53 milliseconds after
  // the explicit rounding above, and building an out-of-range `DateTime`
  // throws for zoned inputs rather than yielding a NaN we could detect.
  const epochMillis = BigInt(DateTime.toEpochMillis(dateTime)) + millis;

  if (epochMillis > maxEpochMillis || epochMillis < -maxEpochMillis) {
    return Option.none();
  }

  // In range, so this narrowing is exact.
  const shifted = DateTime.unsafeMake(Number(epochMillis));

  return Option.some(
    DateTime.isZoned(dateTime)
      ? DateTime.setZone(shifted, dateTime.zone)
      : shifted,
  );
};
