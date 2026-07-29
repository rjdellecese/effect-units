import * as Acceleration from "./Acceleration.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type AccelerationExact =
  QuantityExact.QuantityExact<Acceleration.MetersPerSecondSquared>;

export const AccelerationExact = QuantityExact.QuantityExact(
  Acceleration.MetersPerSecondSquared,
);
export const AccelerationExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Acceleration.MetersPerSecondSquared,
);

const make = (value: Rational.Rational): AccelerationExact =>
  QuantityExact.make(Acceleration.MetersPerSecondSquared, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const metersPerSecondSquared = (r: Rational.Rational) => make(r);

export const inMetersPerSecondSquared = (a: AccelerationExact) => a.value;

export const feetPerSecondSquared = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerFoot));

export const inFeetPerSecondSquared = (a: AccelerationExact) =>
  Rational.divideUnsafe(a.value, ConstantsExact.metersPerFoot);

/** One gee is the standard acceleration due to gravity. */
export const gees = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.gee));

export const inGees = (a: AccelerationExact) =>
  Rational.divideUnsafe(a.value, ConstantsExact.gee);
