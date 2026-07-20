import * as Area from "./Area.ts";
import * as Constants from "./internal/constants.ts";
import * as LuminousFlux from "./LuminousFlux.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

export type Lux = Unit.Rate<LuminousFlux.Lumens, Area.SquareMeters>;
export const Lux: Lux = Unit.rate(LuminousFlux.Lumens, Area.SquareMeters);

export type Illuminance = Quantity.Quantity<Lux>;

export const Illuminance = Quantity.Quantity(Lux);
export const IlluminanceFromSelf = Quantity.QuantityFromSelf(Lux);

const make = (value: number): Illuminance => Quantity.make(Lux, value);

export const zero = make(0);

export const lux = (n: number) => make(n);

export const inLux = (i: Illuminance) => i.value;

/** One foot candle is one lumen per square foot. */
const luxPerFootCandle =
  1 / (Constants.metersPerFoot * Constants.metersPerFoot);

export const footCandles = (n: number) => make(n * luxPerFootCandle);

export const inFootCandles = (i: Illuminance) => i.value / luxPerFootCandle;
