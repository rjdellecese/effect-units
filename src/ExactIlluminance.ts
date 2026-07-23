import * as ExactQuantity from "./ExactQuantity.ts";
import * as Illuminance from "./Illuminance.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as Rational from "./Rational.ts";

export type ExactIlluminance = ExactQuantity.ExactQuantity<Illuminance.Lux>;

export const ExactIlluminance = ExactQuantity.ExactQuantity(Illuminance.Lux);
export const ExactIlluminanceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Illuminance.Lux,
);

const make = (value: Rational.Rational): ExactIlluminance =>
  ExactQuantity.make(Illuminance.Lux, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const lux = (r: Rational.Rational) => make(r);

export const inLux = (i: ExactIlluminance) => i.value;

/**
 * One foot candle is one lumen per square foot — exactly 1562500/145161 lux.
 */
const luxPerFootCandle = Rational.unsafeDivide(
  Rational.one,
  Rational.multiply(ExactConstants.metersPerFoot, ExactConstants.metersPerFoot),
);

export const footCandles = (r: Rational.Rational) =>
  make(Rational.multiply(r, luxPerFootCandle));

export const inFootCandles = (i: ExactIlluminance) =>
  Rational.unsafeDivide(i.value, luxPerFootCandle);
