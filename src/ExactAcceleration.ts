import * as Acceleration from "./Acceleration.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as Rational from "./Rational.ts";

export type ExactAcceleration =
  ExactQuantity.ExactQuantity<Acceleration.MetersPerSecondSquared>;

export const ExactAcceleration = ExactQuantity.ExactQuantity(
  Acceleration.MetersPerSecondSquared,
);
export const ExactAccelerationFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Acceleration.MetersPerSecondSquared,
);

const make = (value: Rational.Rational): ExactAcceleration =>
  ExactQuantity.make(Acceleration.MetersPerSecondSquared, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const metersPerSecondSquared = (r: Rational.Rational) => make(r);

export const inMetersPerSecondSquared = (a: ExactAcceleration) => a.value;

export const feetPerSecondSquared = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerFoot));

export const inFeetPerSecondSquared = (a: ExactAcceleration) =>
  Rational.unsafeDivide(a.value, ExactConstants.metersPerFoot);

/** One gee is the standard acceleration due to gravity. */
export const gees = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.gee));

export const inGees = (a: ExactAcceleration) =>
  Rational.unsafeDivide(a.value, ExactConstants.gee);
