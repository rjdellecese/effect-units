import * as Quantity from "./Quantity";

export type Coulombs = "Coulombs";
export const Coulombs: Coulombs = "Coulombs";

export type Charge = Quantity.Quantity<Coulombs>;

export const Charge = Quantity.Quantity(Coulombs);
export const ChargeFromSelf = Quantity.QuantityFromSelf(Coulombs);

const make = (value: number): Charge => Quantity.make(Coulombs, value);

export const zero = make(0);

export const coulombs = (n: number) => make(n);

export const inCoulombs = (c: Charge) => c.value;

const coulombsPerAmpereHour = 3600;

export const ampereHours = (n: number) => make(n * coulombsPerAmpereHour);

export const inAmpereHours = (c: Charge) => c.value / coulombsPerAmpereHour;

const coulombsPerMilliampereHour = 3.6;

export const milliampereHours = (n: number) =>
  make(n * coulombsPerMilliampereHour);

export const inMilliampereHours = (c: Charge) =>
  c.value / coulombsPerMilliampereHour;
