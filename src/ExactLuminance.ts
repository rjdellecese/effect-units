import * as ExactQuantity from "./ExactQuantity.ts";
import * as Luminance from "./Luminance.ts";
import * as Rational from "./Rational.ts";

export type ExactLuminance = ExactQuantity.ExactQuantity<Luminance.Nits>;

export const ExactLuminance = ExactQuantity.ExactQuantity(Luminance.Nits);
export const ExactLuminanceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Luminance.Nits,
);

const make = (value: Rational.Rational): ExactLuminance =>
  ExactQuantity.make(Luminance.Nits, value);

export const zero = make(Rational.zero);

export const nits = (r: Rational.Rational) => make(r);

export const inNits = (l: ExactLuminance) => l.value;

// NOTE: no footLamberts — one foot-lambert is 1/π candelas per square foot,
// and π has no exact rational representation. Use Luminance.footLamberts on
// the float side.
