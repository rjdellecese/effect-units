import * as BigDecimal from "effect/BigDecimal";

import * as Area from "./Area";
import * as LuminousFlux from "./LuminousFlux";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Lux = Unit.Rate<LuminousFlux.Lumens, Area.SquareMeters>;
export const Lux: Lux = Unit.rate(LuminousFlux.Lumens, Area.SquareMeters);

export type Illuminance = Quantity.Quantity<Lux>;

export const Illuminance = Quantity.Quantity(Lux);
export const IlluminanceFromSelf = Quantity.QuantityFromSelf(Lux);

const make = (value: BigDecimal.BigDecimal): Illuminance =>
  Quantity.make(Lux, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const lux = (n: BigDecimal.BigDecimal) => make(n);

export const inLux = (i: Illuminance) => i.value;

/**
 * One foot candle is one lumen per square foot. The exact ratio is
 * non-terminating, so it is precomputed once (rounded at 100 significant
 * digits) and used symmetrically, keeping roundtrips exact.
 */
const luxPerFootCandle = BigDecimal.unsafeDivide(
  BigDecimal.fromBigInt(1n),
  BigDecimal.make(9290304n, 8),
);

export const footCandles = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, luxPerFootCandle));

export const inFootCandles = (i: Illuminance) =>
  BigDecimal.unsafeDivide(i.value, luxPerFootCandle);
