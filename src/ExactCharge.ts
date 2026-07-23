import * as Charge from "./Charge.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactCharge = ExactQuantity.ExactQuantity<Charge.Coulombs>;

export const ExactCharge = ExactQuantity.ExactQuantity(Charge.Coulombs);
export const ExactChargeFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Charge.Coulombs,
);

const make = (value: Rational.Rational): ExactCharge =>
  ExactQuantity.make(Charge.Coulombs, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const coulombs = (r: Rational.Rational) => make(r);

export const inCoulombs = (c: ExactCharge) => c.value;

/** One ampere hour is one ampere (a coulomb per second) for one hour. */
const coulombsPerAmpereHour = ExactConstants.secondsPerHour;

export const ampereHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, coulombsPerAmpereHour));

export const inAmpereHours = (c: ExactCharge) =>
  Rational.unsafeDivide(c.value, coulombsPerAmpereHour);

/** One milliampere hour is exactly 18/5 (3.6) coulombs. */
const coulombsPerMilliampereHour = ExactPrefix.toBase(
  "Milli",
  coulombsPerAmpereHour,
);

export const milliampereHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, coulombsPerMilliampereHour));

export const inMilliampereHours = (c: ExactCharge) =>
  Rational.unsafeDivide(c.value, coulombsPerMilliampereHour);
