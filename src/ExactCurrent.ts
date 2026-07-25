import * as Current from "./Current.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactCurrent = ExactQuantity.ExactQuantity<Current.Amperes>;

export const ExactCurrent = ExactQuantity.ExactQuantity(Current.Amperes);
export const ExactCurrentFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Current.Amperes,
);

const make = (value: Rational.Rational): ExactCurrent =>
  ExactQuantity.make(Current.Amperes, value);

export const zero = make(Rational.zero);

export const amperes = (r: Rational.Rational) => make(r);

export const inAmperes = (c: ExactCurrent) => c.value;

export const milliamperes = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Milli", r));

export const inMilliamperes = (c: ExactCurrent) =>
  ExactPrefix.toPrefixed("Milli", c.value);
