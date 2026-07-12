import * as BigDecimal from "effect/BigDecimal";

import * as Quantity from "./Quantity";

export type Lumens = "Lumens";
export const Lumens: Lumens = "Lumens";

export type LuminousFlux = Quantity.Quantity<Lumens>;

export const LuminousFlux = Quantity.Quantity(Lumens);
export const LuminousFluxFromSelf = Quantity.QuantityFromSelf(Lumens);

const make = (value: BigDecimal.BigDecimal): LuminousFlux =>
  Quantity.make(Lumens, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const lumens = (n: BigDecimal.BigDecimal) => make(n);

export const inLumens = (f: LuminousFlux) => f.value;
