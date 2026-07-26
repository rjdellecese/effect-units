import * as ConstantsExact from "./internal/constantsExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Speed from "./Speed.ts";

export type SpeedExact = QuantityExact.QuantityExact<Speed.MetersPerSecond>;

export const SpeedExact = QuantityExact.QuantityExact(Speed.MetersPerSecond);
export const SpeedExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Speed.MetersPerSecond,
);

const make = (value: Rational.Rational): SpeedExact =>
  QuantityExact.make(Speed.MetersPerSecond, value);

export const zero = make(Rational.zero);

export const metersPerSecond = (r: Rational.Rational) => make(r);

export const inMetersPerSecond = (s: SpeedExact) => s.value;

/** One kilometer per hour is exactly 5/18 meters per second. */
const metersPerSecondPerKilometerPerHour = Rational.unsafeDivide(
  Rational.unsafeMake(1000n),
  ConstantsExact.secondsPerHour,
);

export const kilometersPerHour = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerSecondPerKilometerPerHour));

export const inKilometersPerHour = (s: SpeedExact) =>
  Rational.unsafeDivide(s.value, metersPerSecondPerKilometerPerHour);

export const feetPerSecond = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerFoot));

export const inFeetPerSecond = (s: SpeedExact) =>
  Rational.unsafeDivide(s.value, ConstantsExact.metersPerFoot);

/** One mile per hour is exactly 1397/3125 (0.44704) meters per second. */
const metersPerSecondPerMilePerHour = Rational.unsafeDivide(
  ConstantsExact.metersPerMile,
  ConstantsExact.secondsPerHour,
);

export const milesPerHour = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerSecondPerMilePerHour));

export const inMilesPerHour = (s: SpeedExact) =>
  Rational.unsafeDivide(s.value, metersPerSecondPerMilePerHour);
