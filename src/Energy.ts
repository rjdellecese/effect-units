import * as BigDecimal from "effect/BigDecimal";

import * as Force from "./Force";
import * as Length from "./Length";
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

// Because the library's mass base unit is grams (not kilograms), one joule
// is 1000 base units (g·m²/s²).
const baseUnitsPerJoule = BigDecimal.fromBigInt(1000n);

export const joules = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerJoule));

export const inJoules = (e: Energy) =>
  BigDecimal.unsafeDivide(e.value, baseUnitsPerJoule);

const baseUnitsPerKilojoule = BigDecimal.fromBigInt(1_000_000n);

export const kilojoules = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilojoule));

export const inKilojoules = (e: Energy) =>
  BigDecimal.unsafeDivide(e.value, baseUnitsPerKilojoule);

const baseUnitsPerMegajoule = BigDecimal.fromBigInt(1_000_000_000n);

export const megajoules = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMegajoule));

export const inMegajoules = (e: Energy) =>
  BigDecimal.unsafeDivide(e.value, baseUnitsPerMegajoule);

/** One kilowatt hour is 3.6 million joules. */
const baseUnitsPerKilowattHour = BigDecimal.fromBigInt(3_600_000_000n);

export const kilowattHours = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilowattHour));

export const inKilowattHours = (e: Energy) =>
  BigDecimal.unsafeDivide(e.value, baseUnitsPerKilowattHour);
