import * as Illuminance from "./Illuminance.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type IlluminanceExact = QuantityExact.QuantityExact<Illuminance.Lux>;

export const IlluminanceExact = QuantityExact.QuantityExact(Illuminance.Lux);
export const IlluminanceExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Illuminance.Lux,
);

const make = (value: Rational.Rational): IlluminanceExact =>
  QuantityExact.make(Illuminance.Lux, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const lux = (r: Rational.Rational) => make(r);

export const inLux = (i: IlluminanceExact) => i.value;

/**
 * One foot candle is one lumen per square foot—exactly 1562500/145161 lux.
 */
const luxPerFootCandle = Rational.unsafeDivide(
  Rational.one,
  Rational.multiply(ConstantsExact.metersPerFoot, ConstantsExact.metersPerFoot),
);

export const footCandles = (r: Rational.Rational) =>
  make(Rational.multiply(r, luxPerFootCandle));

export const inFootCandles = (i: IlluminanceExact) =>
  Rational.unsafeDivide(i.value, luxPerFootCandle);
