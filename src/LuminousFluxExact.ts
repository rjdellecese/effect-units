import * as LuminousFlux from "./LuminousFlux.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type LuminousFluxExact =
  QuantityExact.QuantityExact<LuminousFlux.Lumens>;

export const LuminousFluxExact = QuantityExact.QuantityExact(
  LuminousFlux.Lumens,
);
export const LuminousFluxExactFromSelf = QuantityExact.QuantityExactFromSelf(
  LuminousFlux.Lumens,
);

const make = (value: Rational.Rational): LuminousFluxExact =>
  QuantityExact.make(LuminousFlux.Lumens, value);

export const zero = make(Rational.zero);

export const lumens = (r: Rational.Rational) => make(r);

export const inLumens = (f: LuminousFluxExact) => f.value;
