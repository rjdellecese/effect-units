import * as Energy from "./Energy.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactEnergy = ExactQuantity.ExactQuantity<Energy.Joules>;

export const ExactEnergy = ExactQuantity.ExactQuantity(Energy.Joules);
export const ExactEnergyFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Energy.Joules,
);

const make = (value: Rational.Rational): ExactEnergy =>
  ExactQuantity.make(Energy.Joules, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const joules = (r: Rational.Rational) => make(r);

export const inJoules = (e: ExactEnergy) => e.value;

export const kilojoules = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilojoules = (e: ExactEnergy) =>
  ExactPrefix.toPrefixed("Kilo", e.value);

export const megajoules = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Mega", r));

export const inMegajoules = (e: ExactEnergy) =>
  ExactPrefix.toPrefixed("Mega", e.value);

/**
 * One kilowatt hour is one kilowatt (1000 joules per second) for one hour —
 * exactly 3600000 joules.
 */
const wattsPerKilowatt = Rational.unsafeMake(1000n);
const joulesPerKilowattHour = Rational.multiply(
  wattsPerKilowatt,
  ExactConstants.secondsPerHour,
);

export const kilowattHours = (r: Rational.Rational) =>
  make(Rational.multiply(r, joulesPerKilowattHour));

export const inKilowattHours = (e: ExactEnergy) =>
  Rational.unsafeDivide(e.value, joulesPerKilowattHour);
