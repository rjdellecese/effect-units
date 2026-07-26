import * as Current from "./Current.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type CurrentExact = QuantityExact.QuantityExact<Current.Amperes>;

export const CurrentExact = QuantityExact.QuantityExact(Current.Amperes);
export const CurrentExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Current.Amperes,
);

const make = (value: Rational.Rational): CurrentExact =>
  QuantityExact.make(Current.Amperes, value);

export const zero = make(Rational.zero);

export const amperes = (r: Rational.Rational) => make(r);

export const inAmperes = (c: CurrentExact) => c.value;

export const milliamperes = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Milli", r));

export const inMilliamperes = (c: CurrentExact) =>
  PrefixExact.toPrefixed("Milli", c.value);
