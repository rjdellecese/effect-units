import * as ExactQuantity from "./ExactQuantity.ts";
import * as Force from "./Force.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactForce = ExactQuantity.ExactQuantity<Force.Newtons>;

export const ExactForce = ExactQuantity.ExactQuantity(Force.Newtons);
export const ExactForceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Force.Newtons,
);

const make = (value: Rational.Rational): ExactForce =>
  ExactQuantity.make(Force.Newtons, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const newtons = (r: Rational.Rational) => make(r);

export const inNewtons = (f: ExactForce) => f.value;

export const kilonewtons = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilonewtons = (f: ExactForce) =>
  ExactPrefix.toPrefixed("Kilo", f.value);

export const meganewtons = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Mega", r));

export const inMeganewtons = (f: ExactForce) =>
  ExactPrefix.toPrefixed("Mega", f.value);

const newtonsPerPound = ExactConstants.newtonsPerPoundForce;

export const pounds = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonsPerPound));

export const inPounds = (f: ExactForce) =>
  Rational.unsafeDivide(f.value, newtonsPerPound);

/**
 * One kip is 1000 pounds of force — exactly 8896443230521/2000000000
 * (4448.2216152605) newtons.
 */
const newtonsPerKip = Rational.multiply(newtonsPerPound, Rational.make(1000n));

export const kips = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonsPerKip));

export const inKips = (f: ExactForce) =>
  Rational.unsafeDivide(f.value, newtonsPerKip);
