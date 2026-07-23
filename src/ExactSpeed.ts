import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as Rational from "./Rational.ts";
import * as Speed from "./Speed.ts";

export type ExactSpeed = ExactQuantity.ExactQuantity<Speed.MetersPerSecond>;

export const ExactSpeed = ExactQuantity.ExactQuantity(Speed.MetersPerSecond);
export const ExactSpeedFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Speed.MetersPerSecond,
);

const make = (value: Rational.Rational): ExactSpeed =>
  ExactQuantity.make(Speed.MetersPerSecond, value);

export const zero = make(Rational.zero);

export const metersPerSecond = (r: Rational.Rational) => make(r);

export const inMetersPerSecond = (s: ExactSpeed) => s.value;

/** One kilometer per hour is exactly 5/18 meters per second. */
const metersPerSecondPerKilometerPerHour = Rational.unsafeDivide(
  Rational.make(1000n),
  ExactConstants.secondsPerHour,
);

export const kilometersPerHour = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerSecondPerKilometerPerHour));

export const inKilometersPerHour = (s: ExactSpeed) =>
  Rational.unsafeDivide(s.value, metersPerSecondPerKilometerPerHour);

export const feetPerSecond = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerFoot));

export const inFeetPerSecond = (s: ExactSpeed) =>
  Rational.unsafeDivide(s.value, ExactConstants.metersPerFoot);

/** One mile per hour is exactly 1397/3125 (0.44704) meters per second. */
const metersPerSecondPerMilePerHour = Rational.unsafeDivide(
  ExactConstants.metersPerMile,
  ExactConstants.secondsPerHour,
);

export const milesPerHour = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerSecondPerMilePerHour));

export const inMilesPerHour = (s: ExactSpeed) =>
  Rational.unsafeDivide(s.value, metersPerSecondPerMilePerHour);
