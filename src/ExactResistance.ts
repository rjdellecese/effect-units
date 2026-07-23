import * as ExactQuantity from "./ExactQuantity.ts";
import * as Rational from "./Rational.ts";
import * as Resistance from "./Resistance.ts";

export type ExactResistance = ExactQuantity.ExactQuantity<Resistance.Ohms>;

export const ExactResistance = ExactQuantity.ExactQuantity(Resistance.Ohms);
export const ExactResistanceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Resistance.Ohms,
);

const make = (value: Rational.Rational): ExactResistance =>
  ExactQuantity.make(Resistance.Ohms, value);

export const zero = make(Rational.zero);

export const ohms = (r: Rational.Rational) => make(r);

export const inOhms = (r: ExactResistance) => r.value;
