import * as Force from "./Force.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type ForceExact = QuantityExact.QuantityExact<Force.Newtons>;

export const ForceExact = QuantityExact.QuantityExact(Force.Newtons);
export const ForceExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Force.Newtons,
);

const make = (value: Rational.Rational): ForceExact =>
  QuantityExact.make(Force.Newtons, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const newtons = (r: Rational.Rational) => make(r);

export const inNewtons = (f: ForceExact) => f.value;

export const kilonewtons = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilonewtons = (f: ForceExact) =>
  PrefixExact.toPrefixed("Kilo", f.value);

export const meganewtons = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Mega", r));

export const inMeganewtons = (f: ForceExact) =>
  PrefixExact.toPrefixed("Mega", f.value);

const newtonsPerPound = ConstantsExact.newtonsPerPoundForce;

export const pounds = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonsPerPound));

export const inPounds = (f: ForceExact) =>
  Rational.unsafeDivide(f.value, newtonsPerPound);

/**
 * One kip is 1000 pounds of force—exactly 8896443230521/2000000000
 * (4448.2216152605) newtons.
 */
const newtonsPerKip = Rational.multiply(
  newtonsPerPound,
  Rational.unsafeMake(1000n),
);

export const kips = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonsPerKip));

export const inKips = (f: ForceExact) =>
  Rational.unsafeDivide(f.value, newtonsPerKip);
