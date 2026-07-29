import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as Pressure from "./Pressure.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type PressureExact = QuantityExact.QuantityExact<Pressure.Pascals>;

export const PressureExact = QuantityExact.QuantityExact(Pressure.Pascals);
export const PressureExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Pressure.Pascals,
);

const make = (value: Rational.Rational): PressureExact =>
  QuantityExact.make(Pressure.Pascals, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const pascals = (r: Rational.Rational) => make(r);

export const inPascals = (p: PressureExact) => p.value;

export const kilopascals = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilopascals = (p: PressureExact) =>
  PrefixExact.toPrefixed("Kilo", p.value);

export const megapascals = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Mega", r));

export const inMegapascals = (p: PressureExact) =>
  PrefixExact.toPrefixed("Mega", p.value);

/**
 * One pound per square inch is one pound of force per square inch—exactly
 * 8896443230521/1290320000 pascals.
 */
const pascalsPerPoundPerSquareInch = Rational.divideUnsafe(
  ConstantsExact.newtonsPerPoundForce,
  Rational.multiply(ConstantsExact.metersPerInch, ConstantsExact.metersPerInch),
);

export const poundsPerSquareInch = (r: Rational.Rational) =>
  make(Rational.multiply(r, pascalsPerPoundPerSquareInch));

export const inPoundsPerSquareInch = (p: PressureExact) =>
  Rational.divideUnsafe(p.value, pascalsPerPoundPerSquareInch);

/** One standard atmosphere is 101325 pascals. */
const pascalsPerAtmosphere = Rational.makeUnsafe(101_325n);

export const atmospheres = (r: Rational.Rational) =>
  make(Rational.multiply(r, pascalsPerAtmosphere));

export const inAtmospheres = (p: PressureExact) =>
  Rational.divideUnsafe(p.value, pascalsPerAtmosphere);
