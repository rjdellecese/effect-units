import * as BigDecimal from "effect/BigDecimal";

import * as Area from "./Area";
import * as Force from "./Force";
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

// Because the library's mass base unit is grams (not kilograms), one pascal
// is 1000 base units (g/(m·s²)).
const baseUnitsPerPascal = BigDecimal.fromBigInt(1000n);

export const pascals = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPascal));

export const inPascals = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerPascal);

const baseUnitsPerKilopascal = BigDecimal.fromBigInt(1_000_000n);

export const kilopascals = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilopascal));

export const inKilopascals = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerKilopascal);

const baseUnitsPerMegapascal = BigDecimal.fromBigInt(1_000_000_000n);

export const megapascals = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMegapascal));

export const inMegapascals = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerMegapascal);

/**
 * One pound per square inch is one pound of force per square inch. The exact
 * ratio is non-terminating, so it is precomputed once (rounded at 100
 * significant digits) and used symmetrically, keeping roundtrips exact.
 */
const baseUnitsPerPoundPerSquareInch = BigDecimal.unsafeDivide(
  BigDecimal.make(44482216152605n, 10),
  BigDecimal.make(64516n, 8),
);

export const poundsPerSquareInch = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPoundPerSquareInch));

export const inPoundsPerSquareInch = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerPoundPerSquareInch);

/** One standard atmosphere is 101325 pascals, exactly. */
const baseUnitsPerAtmosphere = BigDecimal.fromBigInt(101_325_000n);

export const atmospheres = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerAtmosphere));

export const inAtmospheres = (p: Pressure) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerAtmosphere);
