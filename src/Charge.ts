import * as BigDecimal from "effect/BigDecimal";

import * as Quantity from "./Quantity";

export type Coulombs = "Coulombs";
export const Coulombs: Coulombs = "Coulombs";

export type Charge = Quantity.Quantity<Coulombs>;

export const Charge = Quantity.Quantity(Coulombs);
export const ChargeFromSelf = Quantity.QuantityFromSelf(Coulombs);

const make = (value: BigDecimal.BigDecimal): Charge =>
  Quantity.make(Coulombs, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const coulombs = (n: BigDecimal.BigDecimal) => make(n);

export const inCoulombs = (c: Charge) => c.value;

const coulombsPerAmpereHour = BigDecimal.fromBigInt(3600n);

export const ampereHours = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, coulombsPerAmpereHour));

export const inAmpereHours = (c: Charge) =>
  BigDecimal.unsafeDivide(c.value, coulombsPerAmpereHour);

const coulombsPerMilliampereHour = BigDecimal.make(36n, 1);

export const milliampereHours = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, coulombsPerMilliampereHour));

export const inMilliampereHours = (c: Charge) =>
  BigDecimal.unsafeDivide(c.value, coulombsPerMilliampereHour);
