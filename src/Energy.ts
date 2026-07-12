import * as BigDecimal from "effect/BigDecimal";

import * as Force from "./Force";
import * as Length from "./Length";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Joules = Unit.Product<Force.Newtons, Length.Meters>;
export const Joules: Joules = Unit.product(Force.Newtons, Length.Meters);

export type Energy = Quantity.Quantity<Joules>;

export const Energy = Quantity.Quantity(Joules);
export const EnergyFromSelf = Quantity.QuantityFromSelf(Joules);

const make = (value: BigDecimal.BigDecimal): Energy =>
  Quantity.make(Joules, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const joules = (n: BigDecimal.BigDecimal) => make(n);

export const inJoules = (e: Energy) => e.value;

export const kilojoules = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilojoules = (e: Energy) => Prefix.toPrefixed("Kilo", e.value);

export const megajoules = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Mega", n));

export const inMegajoules = (e: Energy) => Prefix.toPrefixed("Mega", e.value);

/** One kilowatt hour is 3.6 million joules. */
const joulesPerKilowattHour = BigDecimal.fromBigInt(3_600_000n);

export const kilowattHours = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, joulesPerKilowattHour));

export const inKilowattHours = (e: Energy) =>
  BigDecimal.unsafeDivide(e.value, joulesPerKilowattHour);
