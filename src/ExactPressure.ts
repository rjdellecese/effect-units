import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Pressure from "./Pressure.ts";
import * as Rational from "./Rational.ts";

export type ExactPressure = ExactQuantity.ExactQuantity<Pressure.Pascals>;

export const ExactPressure = ExactQuantity.ExactQuantity(Pressure.Pascals);
export const ExactPressureFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Pressure.Pascals,
);

const make = (value: Rational.Rational): ExactPressure =>
  ExactQuantity.make(Pressure.Pascals, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const pascals = (r: Rational.Rational) => make(r);

export const inPascals = (p: ExactPressure) => p.value;

export const kilopascals = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilopascals = (p: ExactPressure) =>
  ExactPrefix.toPrefixed("Kilo", p.value);

export const megapascals = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Mega", r));

export const inMegapascals = (p: ExactPressure) =>
  ExactPrefix.toPrefixed("Mega", p.value);

/**
 * One pound per square inch is one pound of force per square inch — exactly
 * 8896443230521/1290320000 pascals.
 */
const pascalsPerPoundPerSquareInch = Rational.unsafeDivide(
  ExactConstants.newtonsPerPoundForce,
  Rational.multiply(ExactConstants.metersPerInch, ExactConstants.metersPerInch),
);

export const poundsPerSquareInch = (r: Rational.Rational) =>
  make(Rational.multiply(r, pascalsPerPoundPerSquareInch));

export const inPoundsPerSquareInch = (p: ExactPressure) =>
  Rational.unsafeDivide(p.value, pascalsPerPoundPerSquareInch);

/** One standard atmosphere is 101325 pascals. */
const pascalsPerAtmosphere = Rational.unsafeMake(101_325n);

export const atmospheres = (r: Rational.Rational) =>
  make(Rational.multiply(r, pascalsPerAtmosphere));

export const inAtmospheres = (p: ExactPressure) =>
  Rational.unsafeDivide(p.value, pascalsPerAtmosphere);
