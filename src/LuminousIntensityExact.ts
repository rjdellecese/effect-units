import * as LuminousIntensity from "./LuminousIntensity.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type LuminousIntensityExact =
  QuantityExact.QuantityExact<LuminousIntensity.Candelas>;

export const LuminousIntensityExact = QuantityExact.QuantityExact(
  LuminousIntensity.Candelas,
);
export const LuminousIntensityExactFromStruct =
  QuantityExact.QuantityExactFromStruct(LuminousIntensity.Candelas);

const make = (value: Rational.Rational): LuminousIntensityExact =>
  QuantityExact.make(LuminousIntensity.Candelas, value);

export const zero = make(Rational.zero);

export const candelas = (r: Rational.Rational) => make(r);

export const inCandelas = (i: LuminousIntensityExact) => i.value;
