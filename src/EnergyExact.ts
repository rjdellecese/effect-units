import * as Energy from "./Energy.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type EnergyExact = QuantityExact.QuantityExact<Energy.Joules>;

export const EnergyExact = QuantityExact.QuantityExact(Energy.Joules);
export const EnergyExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Energy.Joules,
);

const make = (value: Rational.Rational): EnergyExact =>
  QuantityExact.make(Energy.Joules, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const joules = (r: Rational.Rational) => make(r);

export const inJoules = (e: EnergyExact) => e.value;

export const kilojoules = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilojoules = (e: EnergyExact) =>
  PrefixExact.toPrefixed("Kilo", e.value);

export const megajoules = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Mega", r));

export const inMegajoules = (e: EnergyExact) =>
  PrefixExact.toPrefixed("Mega", e.value);

/**
 * One kilowatt hour is one kilowatt (1000 joules per second) for one hour —
 * exactly 3600000 joules.
 */
const wattsPerKilowatt = Rational.unsafeMake(1000n);
const joulesPerKilowattHour = Rational.multiply(
  wattsPerKilowatt,
  ConstantsExact.secondsPerHour,
);

export const kilowattHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, joulesPerKilowattHour));

export const inKilowattHours = (e: EnergyExact) =>
  Rational.unsafeDivide(e.value, joulesPerKilowattHour);
