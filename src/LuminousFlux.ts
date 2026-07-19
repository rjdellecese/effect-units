import * as Quantity from "./Quantity";

export type Lumens = "Lumens";
export const Lumens: Lumens = "Lumens";

export type LuminousFlux = Quantity.Quantity<Lumens>;

export const LuminousFlux = Quantity.Quantity(Lumens);
export const LuminousFluxFromSelf = Quantity.QuantityFromSelf(Lumens);

const make = (value: number): LuminousFlux => Quantity.make(Lumens, value);

export const zero = make(0);

export const lumens = (n: number) => make(n);

export const inLumens = (f: LuminousFlux) => f.value;
