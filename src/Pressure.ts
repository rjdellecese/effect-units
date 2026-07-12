import * as BigDecimal from "effect/BigDecimal";

import * as Area from "./Area";
import * as Force from "./Force";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Pascals = Unit.Rate<Force.Newtons, Area.SquareMeters>;
export const Pascals: Pascals = Unit.rate(Force.Newtons, Area.SquareMeters);

export type Pressure = Quantity.Quantity<Pascals>;

export const Pressure = Quantity.Quantity(Pascals);
export const PressureFromSelf = Quantity.QuantityFromSelf(Pascals);

const make = (value: BigDecimal.BigDecimal): Pressure =>
  Quantity.make(Pascals, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const pascals = (n: BigDecimal.BigDecimal) => make(n);

export const inPascals = (p: Pressure) => p.value;

export const kilopascals = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilopascals = (p: Pressure) =>
  Prefix.toPrefixed("Kilo", p.value);

export const megapascals = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Mega", n));

export const inMegapascals = (p: Pressure) =>
  Prefix.toPrefixed("Mega", p.value);

/**
 * One pound per square inch is one pound of force per square inch. The exact
 * ratio is non-terminating, so it is precomputed once (rounded at 100
 * significant digits) and used symmetrically, keeping roundtrips exact.
 */
const pascalsPerPoundPerSquareInch = BigDecimal.unsafeDivide(
  BigDecimal.make(44482216152605n, 13),
  BigDecimal.make(64516n, 8),
);

export const poundsPerSquareInch = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, pascalsPerPoundPerSquareInch));

export const inPoundsPerSquareInch = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, pascalsPerPoundPerSquareInch);

/** One standard atmosphere is 101325 pascals, exactly. */
const pascalsPerAtmosphere = BigDecimal.fromBigInt(101_325n);

export const atmospheres = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, pascalsPerAtmosphere));

export const inAtmospheres = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, pascalsPerAtmosphere);
