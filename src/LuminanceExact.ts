import * as Luminance from "./Luminance.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type LuminanceExact = QuantityExact.QuantityExact<Luminance.Nits>;

export const LuminanceExact = QuantityExact.QuantityExact(Luminance.Nits);
export const LuminanceExactFromStruct = QuantityExact.QuantityExactFromStruct(
  Luminance.Nits,
);

const make = (value: Rational.Rational): LuminanceExact =>
  QuantityExact.make(Luminance.Nits, value);

export const zero = make(Rational.zero);

export const nits = (r: Rational.Rational) => make(r);

export const inNits = (l: LuminanceExact) => l.value;

// NOTE: no footLamberts—one foot-lambert is 1/π candelas per square foot,
// and π has no exact rational representation. Use Luminance.footLamberts on
// the float side.
