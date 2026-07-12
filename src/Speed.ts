import * as BigDecimal from "effect/BigDecimal";

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

const make = (value: BigDecimal.BigDecimal): Speed =>
  Quantity.make(MetersPerSecond, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const metersPerSecond = (n: BigDecimal.BigDecimal) => make(n);

export const inMetersPerSecond = (s: Speed) => s.value;

const metersPerSecondPerKilometerPerHour = BigDecimal.unsafeDivide(
  BigDecimal.fromBigInt(1000n),
  BigDecimal.fromBigInt(3600n),
);

export const kilometersPerHour = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerSecondPerKilometerPerHour));

export const inKilometersPerHour = (s: Speed) =>
  BigDecimal.unsafeDivide(s.value, metersPerSecondPerKilometerPerHour);

const metersPerSecondPerFootPerSecond = BigDecimal.make(3048n, 4);

export const feetPerSecond = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerSecondPerFootPerSecond));

export const inFeetPerSecond = (s: Speed) =>
  BigDecimal.unsafeDivide(s.value, metersPerSecondPerFootPerSecond);

const metersPerSecondPerMilePerHour = BigDecimal.make(44704n, 5);

export const milesPerHour = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerSecondPerMilePerHour));

export const inMilesPerHour = (s: Speed) =>
  BigDecimal.unsafeDivide(s.value, metersPerSecondPerMilePerHour);
