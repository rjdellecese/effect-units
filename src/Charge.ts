import * as Constants from "./internal/constants.js";
import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";

export type Coulombs = "Coulombs";
export const Coulombs: Coulombs = "Coulombs";

export type Charge = Quantity.Quantity<Coulombs>;

export const Charge = Quantity.Quantity(Coulombs);
export const ChargeFromSelf = Quantity.QuantityFromSelf(Coulombs);

const make = (value: number): Charge => Quantity.make(Coulombs, value);

export const zero = make(0);

export const coulombs = (n: number) => make(n);

export const inCoulombs = (c: Charge) => c.value;

/** One ampere hour is one ampere (a coulomb per second) for one hour. */
const coulombsPerAmpereHour = Constants.secondsPerHour;

export const ampereHours = (n: number) => make(n * coulombsPerAmpereHour);

export const inAmpereHours = (c: Charge) => c.value / coulombsPerAmpereHour;

const coulombsPerMilliampereHour = Prefix.toBase(
  "Milli",
  coulombsPerAmpereHour,
);

export const milliampereHours = (n: number) =>
  make(n * coulombsPerMilliampereHour);

export const inMilliampereHours = (c: Charge) =>
  c.value / coulombsPerMilliampereHour;
