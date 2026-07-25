import * as ExactQuantity from "./ExactQuantity.ts";
import * as LuminousFlux from "./LuminousFlux.ts";
import * as Rational from "./Rational.ts";

export type ExactLuminousFlux =
  ExactQuantity.ExactQuantity<LuminousFlux.Lumens>;

export const ExactLuminousFlux = ExactQuantity.ExactQuantity(
  LuminousFlux.Lumens,
);
export const ExactLuminousFluxFromSelf = ExactQuantity.ExactQuantityFromSelf(
  LuminousFlux.Lumens,
);

const make = (value: Rational.Rational): ExactLuminousFlux =>
  ExactQuantity.make(LuminousFlux.Lumens, value);

export const zero = make(Rational.zero);

export const lumens = (r: Rational.Rational) => make(r);

export const inLumens = (f: ExactLuminousFlux) => f.value;
