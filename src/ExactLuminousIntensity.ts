import * as ExactQuantity from "./ExactQuantity.ts";
import * as LuminousIntensity from "./LuminousIntensity.ts";
import * as Rational from "./Rational.ts";

export type ExactLuminousIntensity =
  ExactQuantity.ExactQuantity<LuminousIntensity.Candelas>;

export const ExactLuminousIntensity = ExactQuantity.ExactQuantity(
  LuminousIntensity.Candelas,
);
export const ExactLuminousIntensityFromSelf =
  ExactQuantity.ExactQuantityFromSelf(LuminousIntensity.Candelas);

const make = (value: Rational.Rational): ExactLuminousIntensity =>
  ExactQuantity.make(LuminousIntensity.Candelas, value);

export const zero = make(Rational.zero);

export const candelas = (r: Rational.Rational) => make(r);

export const inCandelas = (i: ExactLuminousIntensity) => i.value;
