import * as DateTime from "effect/DateTime";
import * as EffectDuration from "effect/Duration";
import * as Option from "effect/Option";

import * as Constants from "./internal/constants.ts";
import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";

export type Seconds = "Seconds";
export const Seconds: Seconds = "Seconds";

export type Duration = Quantity.Quantity<Seconds>;

export const Duration = Quantity.Quantity(Seconds);
export const DurationFromStruct = Quantity.QuantityFromStruct(Seconds);

const make = (value: number): Duration => Quantity.make(Seconds, value);

export const zero = make(0);

export const seconds = (n: number) => make(n);

export const inSeconds = (d: Duration) => d.value;

export const milliseconds = (n: number) => make(Prefix.toBase("Milli", n));

export const inMilliseconds = (d: Duration) =>
  Prefix.toPrefixed("Milli", d.value);

export const minutes = (n: number) => make(n * Constants.secondsPerMinute);

export const inMinutes = (d: Duration) => d.value / Constants.secondsPerMinute;

export const hours = (n: number) => make(n * Constants.secondsPerHour);

export const inHours = (d: Duration) => d.value / Constants.secondsPerHour;

const secondsPerDay = 24 * Constants.secondsPerHour;

export const days = (n: number) => make(n * secondsPerDay);

export const inDays = (d: Duration) => d.value / secondsPerDay;

const secondsPerWeek = 7 * secondsPerDay;

export const weeks = (n: number) => make(n * secondsPerWeek);

export const inWeeks = (d: Duration) => d.value / secondsPerWeek;

/** One Julian year is exactly 365.25 days. */
const secondsPerJulianYear = 365.25 * secondsPerDay;

export const julianYears = (n: number) => make(n * secondsPerJulianYear);

export const inJulianYears = (d: Duration) => d.value / secondsPerJulianYear;

// Interop

/**
 * Converts an `effect/Duration` to a `Duration` quantity. Infinite durations
 * become `Infinity` seconds.
 */
export const fromDuration = (duration: EffectDuration.Duration): Duration =>
  milliseconds(EffectDuration.toMillis(duration));

/**
 * Converts a `Duration` quantity to an `effect/Duration`, rounding to the
 * nearest nanosecond. Returns `Option.none()` when the quantity is negative,
 * not finite, or too large for a whole number of nanoseconds to be
 * representable (`effect/Duration`s are non-negative).
 */
export const toDuration = (
  d: Duration,
): Option.Option<EffectDuration.Duration> => {
  const nanos = d.value * 1e9;

  return Number.isFinite(nanos) && nanos >= 0
    ? Option.some(EffectDuration.nanos(BigInt(Math.round(nanos))))
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
  milliseconds(DateTime.toEpochMillis(end) - DateTime.toEpochMillis(start));

/**
 * Adds a duration to a `DateTime`, rounding to the nearest millisecond (the
 * resolution of `DateTime`). Returns `Option.none()` when the duration is
 * not finite or the result falls outside the representable `DateTime`
 * range.
 */
export const addTo = (
  dateTime: DateTime.DateTime,
  duration: Duration,
): Option.Option<DateTime.DateTime> => {
  const millis = Math.round(inMilliseconds(duration));

  if (!Number.isFinite(millis)) {
    return Option.none();
  }

  const result = DateTime.add(dateTime, { milliseconds: millis });

  return Number.isNaN(DateTime.toEpochMillis(result))
    ? Option.none()
    : Option.some(result);
};
