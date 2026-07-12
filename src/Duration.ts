import * as BigDecimal from "effect/BigDecimal";
import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Option from "effect/Option";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Seconds = "Seconds";
export const Seconds: Seconds = "Seconds";

export type Duration = Quantity.Quantity<Seconds>;

export const Duration = Quantity.Quantity(Seconds);
export const DurationFromSelf = Quantity.QuantityFromSelf(Seconds);

const make = (value: BigDecimal.BigDecimal): Duration =>
  Quantity.make(Seconds, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const seconds = (n: BigDecimal.BigDecimal) => make(n);

export const inSeconds = (d: Duration) => d.value;

export const milliseconds = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMilliseconds = (d: Duration) =>
  Prefix.toPrefixed("Milli", d.value);

const secondsPerMinute = BigDecimal.fromBigInt(60n);

export const minutes = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, secondsPerMinute));

export const inMinutes = (d: Duration) =>
  BigDecimal.unsafeDivide(d.value, secondsPerMinute);

const secondsPerHour = BigDecimal.fromBigInt(3600n);

export const hours = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, secondsPerHour));

export const inHours = (d: Duration) =>
  BigDecimal.unsafeDivide(d.value, secondsPerHour);

const secondsPerDay = BigDecimal.fromBigInt(86400n);

export const days = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, secondsPerDay));

export const inDays = (d: Duration) =>
  BigDecimal.unsafeDivide(d.value, secondsPerDay);

const secondsPerWeek = BigDecimal.fromBigInt(604800n);

export const weeks = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, secondsPerWeek));

export const inWeeks = (d: Duration) =>
  BigDecimal.unsafeDivide(d.value, secondsPerWeek);

/** One Julian year is exactly 365.25 days. */
const secondsPerJulianYear = BigDecimal.fromBigInt(31557600n);

export const julianYears = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, secondsPerJulianYear));

export const inJulianYears = (d: Duration) =>
  BigDecimal.unsafeDivide(d.value, secondsPerJulianYear);

// Interop

const nanosPerSecond = BigDecimal.fromBigInt(1_000_000_000n);

/**
 * Converts an `effect/Duration` to a `Duration` quantity. Returns
 * `Option.none()` for non-finite durations.
 */
export const fromDuration = (
  duration: EffectDuration.Duration,
): Option.Option<Duration> =>
  EffectDuration.toNanos(duration).pipe(
    Option.map((nanos) => make(BigDecimal.make(nanos, 9))),
  );

/**
 * Converts a `Duration` quantity to an `effect/Duration`. Returns
 * `Option.none()` when the quantity is negative or not a whole number of
 * nanoseconds (the resolution of `effect/Duration`).
 */
export const toDuration = (
  d: Duration,
): Option.Option<EffectDuration.Duration> => {
  const nanos = BigDecimal.normalize(
    BigDecimal.multiply(d.value, nanosPerSecond),
  );

  return BigDecimal.isInteger(nanos) && !BigDecimal.isNegative(nanos)
    ? Option.some(
        EffectDuration.nanos(nanos.value * 10n ** BigInt(-nanos.scale)),
      )
    : Option.none();
};

/**
 * The signed duration from `start` to `end` (negative when `end` is earlier
 * than `start`).
 */
export const between = (
  start: DateTime.DateTime,
  end: DateTime.DateTime,
): Duration =>
  make(
    BigDecimal.make(
      BigInt(DateTime.toEpochMillis(end) - DateTime.toEpochMillis(start)),
      3,
    ),
  );

/**
 * Adds a duration to a `DateTime`, rounding to the nearest millisecond (the
 * resolution of `DateTime`). Lossy for durations with sub-millisecond
 * precision or magnitudes beyond the safe integer range of milliseconds.
 */
export const addTo = (
  dateTime: DateTime.DateTime,
  duration: Duration,
): DateTime.DateTime =>
  DateTime.add(dateTime, {
    millis: Math.round(
      BigDecimal.unsafeToNumber(
        BigDecimal.multiply(duration.value, BigDecimal.fromBigInt(1000n)),
      ),
    ),
  });
