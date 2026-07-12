import * as Duration from "./Duration";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type MetersPerSecond = Unit.Rate<Length.Meters, Duration.Seconds>;
export const MetersPerSecond: MetersPerSecond = Unit.rate(
  Length.Meters,
  Duration.Seconds,
);

export type Speed = Quantity.Quantity<MetersPerSecond>;

export const Speed = Quantity.Quantity(MetersPerSecond);
export const SpeedFromSelf = Quantity.QuantityFromSelf(MetersPerSecond);

const make = (value: number): Speed => Quantity.make(MetersPerSecond, value);

export const zero = make(0);

export const metersPerSecond = (n: number) => make(n);

export const inMetersPerSecond = (s: Speed) => s.value;

const metersPerSecondPerKilometerPerHour = 1000 / 3600;

export const kilometersPerHour = (n: number) =>
  make(n * metersPerSecondPerKilometerPerHour);

export const inKilometersPerHour = (s: Speed) =>
  s.value / metersPerSecondPerKilometerPerHour;

const metersPerSecondPerFootPerSecond = 0.3048;

export const feetPerSecond = (n: number) =>
  make(n * metersPerSecondPerFootPerSecond);

export const inFeetPerSecond = (s: Speed) =>
  s.value / metersPerSecondPerFootPerSecond;

/** One mile per hour is 0.44704 meters per second. */
const metersPerSecondPerMilePerHour = 1609.344 / 3600;

export const milesPerHour = (n: number) =>
  make(n * metersPerSecondPerMilePerHour);

export const inMilesPerHour = (s: Speed) =>
  s.value / metersPerSecondPerMilePerHour;
