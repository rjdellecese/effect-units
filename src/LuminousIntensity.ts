import * as LuminousFlux from "./LuminousFlux.ts";
import * as Quantity from "./Quantity.ts";
import * as SolidAngle from "./SolidAngle.ts";
import * as Unit from "./Unit.ts";

export type Candelas = Unit.Rate<LuminousFlux.Lumens, SolidAngle.Steradians>;
export const Candelas: Candelas = Unit.rate(
  LuminousFlux.Lumens,
  SolidAngle.Steradians,
);

export type LuminousIntensity = Quantity.Quantity<Candelas>;

export const LuminousIntensity = Quantity.Quantity(Candelas);
export const LuminousIntensityFromSelf = Quantity.QuantityFromSelf(Candelas);

const make = (value: number): LuminousIntensity =>
  Quantity.make(Candelas, value);

export const zero = make(0);

export const candelas = (n: number) => make(n);

export const inCandelas = (i: LuminousIntensity) => i.value;
