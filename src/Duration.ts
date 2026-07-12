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

const make = (value: number): Duration => Quantity.make(Seconds, value);

export const zero = make(0);

export const seconds = (n: number) => make(n);

export const inSeconds = (d: Duration) => d.value;

export const milliseconds = (n: number) => make(Prefix.toBase("Milli", n));

export const inMilliseconds = (d: Duration) =>
  Prefix.toPrefixed("Milli", d.value);

const secondsPerMinute = 60;

export const minutes = (n: number) => make(n * secondsPerMinute);

export const inMinutes = (d: Duration) => d.value / secondsPerMinute;

const secondsPerHour = 3600;

export const hours = (n: number) => make(n * secondsPerHour);

export const inHours = (d: Duration) => d.value / secondsPerHour;

const secondsPerDay = 86400;

export const days = (n: number) => make(n * secondsPerDay);

export const inDays = (d: Duration) => d.value / secondsPerDay;

const secondsPerWeek = 604800;

export const weeks = (n: number) => make(n * secondsPerWeek);

export const inWeeks = (d: Duration) => d.value / secondsPerWeek;

/** One Julian year is exactly 365.25 days. */
const secondsPerJulianYear = 31557600;

export const julianYears = (n: number) => make(n * secondsPerJulianYear);

export const inJulianYears = (d: Duration) => d.value / secondsPerJulianYear;

// Interop

/**
 * Converts an `effect/Duration` to a `Duration` quantity. Infinite durations
 * become `Infinity` seconds.
 */
export const fromDuration = (duration: EffectDuration.Duration): Duration =>
  make(EffectDuration.toMillis(duration) / 1000);

/**
 * Converts a `Duration` quantity to an `effect/Duration`, rounding to the
 * nearest nanosecond. Returns `Option.none()` when the quantity is negative
 * or not finite (`effect/Duration`s are non-negative).
 */
export const toDuration = (
  d: Duration,
): Option.Option<EffectDuration.Duration> =>
  Number.isFinite(d.value) && d.value >= 0
    ? Option.some(EffectDuration.nanos(BigInt(Math.round(d.value * 1e9))))
    : Option.none();

/**
 * The signed duration from `start` to `end` (negative when `end` is earlier
 * than `start`).
 */
export const between = (
  start: DateTime.DateTime,
  end: DateTime.DateTime,
): Duration =>
  make((DateTime.toEpochMillis(end) - DateTime.toEpochMillis(start)) / 1000);

/**
 * Adds a duration to a `DateTime`, rounding to the nearest millisecond (the
 * resolution of `DateTime`).
 */
export const addTo = (
  dateTime: DateTime.DateTime,
  duration: Duration,
): DateTime.DateTime =>
  DateTime.add(dateTime, { millis: Math.round(duration.value * 1000) });
