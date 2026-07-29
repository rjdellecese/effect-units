import * as Charge from "./Charge.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type ChargeExact = QuantityExact.QuantityExact<Charge.Coulombs>;

export const ChargeExact = QuantityExact.QuantityExact(Charge.Coulombs);
export const ChargeExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Charge.Coulombs,
);

const make = (value: Rational.Rational): ChargeExact =>
  QuantityExact.make(Charge.Coulombs, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const coulombs = (r: Rational.Rational) => make(r);

export const inCoulombs = (c: ChargeExact) => c.value;

/** One ampere hour is one ampere (a coulomb per second) for one hour. */
const coulombsPerAmpereHour = ConstantsExact.secondsPerHour;

export const ampereHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, coulombsPerAmpereHour));

export const inAmpereHours = (c: ChargeExact) =>
  Rational.divideUnsafe(c.value, coulombsPerAmpereHour);

/** One milliampere hour is exactly 18/5 (3.6) coulombs. */
const coulombsPerMilliampereHour = PrefixExact.toBase(
  "Milli",
  coulombsPerAmpereHour,
);

export const milliampereHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, coulombsPerMilliampereHour));

export const inMilliampereHours = (c: ChargeExact) =>
  Rational.divideUnsafe(c.value, coulombsPerMilliampereHour);
