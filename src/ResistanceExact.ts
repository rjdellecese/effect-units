import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Resistance from "./Resistance.ts";

export type ResistanceExact = QuantityExact.QuantityExact<Resistance.Ohms>;

export const ResistanceExact = QuantityExact.QuantityExact(Resistance.Ohms);
export const ResistanceExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Resistance.Ohms,
);

const make = (value: Rational.Rational): ResistanceExact =>
  QuantityExact.make(Resistance.Ohms, value);

export const zero = make(Rational.zero);

export const ohms = (r: Rational.Rational) => make(r);

export const inOhms = (r: ResistanceExact) => r.value;
