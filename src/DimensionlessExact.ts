/**
 * The exact twin of `Dimensionless`. Every scale here is a power of ten, so
 * the conversions are exact both ways—`percent(one)` is exactly 1/100, and a
 * third of a whole is exactly 1/3 rather than 0.3333333333333333.
 *
 * @module
 */
import * as Dimensionless from "./Dimensionless.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type DimensionlessExact =
  QuantityExact.QuantityExact<Dimensionless.Unitless>;

export const DimensionlessExact = QuantityExact.QuantityExact(
  Dimensionless.Unitless,
);
export const DimensionlessExactFromStruct =
  QuantityExact.QuantityExactFromStruct(Dimensionless.Unitless);

const make = (value: Rational.Rational): DimensionlessExact =>
  QuantityExact.make(Dimensionless.Unitless, value);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const zero = make(Rational.zero);

/** A factor of one: the identity for `QuantityExact.times`, and 100%. */
export const one = make(Rational.one);

export const fraction = (r: Rational.Rational) => make(r);

export const inFraction = (d: DimensionlessExact) => d.value;

/** One percent (%) is 10⁻², the SI centi- prefix applied to the unit one. */
const fractionPerPercent = Rational.makeUnsafe(1n, 100n);

export const percent = (r: Rational.Rational) =>
  make(Rational.multiply(r, fractionPerPercent));

export const inPercent = (d: DimensionlessExact) =>
  Rational.divideUnsafe(d.value, fractionPerPercent);

/** One per mille (‰) is 10⁻³, a tenth of a percent. */
const fractionPerPerMille = Rational.makeUnsafe(1n, 1000n);

export const perMille = (r: Rational.Rational) =>
  make(Rational.multiply(r, fractionPerPerMille));

export const inPerMille = (d: DimensionlessExact) =>
  Rational.divideUnsafe(d.value, fractionPerPerMille);

/** One basis point (bp) is 10⁻⁴, a hundredth of a percent. */
const fractionPerBasisPoint = Rational.makeUnsafe(1n, 10n ** 4n);

export const basisPoints = (r: Rational.Rational) =>
  make(Rational.multiply(r, fractionPerBasisPoint));

export const inBasisPoints = (d: DimensionlessExact) =>
  Rational.divideUnsafe(d.value, fractionPerBasisPoint);

/** One part per million (ppm) is 10⁻⁶. */
const fractionPerPartPerMillion = Rational.makeUnsafe(1n, 10n ** 6n);

export const partsPerMillion = (r: Rational.Rational) =>
  make(Rational.multiply(r, fractionPerPartPerMillion));

export const inPartsPerMillion = (d: DimensionlessExact) =>
  Rational.divideUnsafe(d.value, fractionPerPartPerMillion);

/** One part per billion (ppb) is 10⁻⁹, on the short scale. */
const fractionPerPartPerBillion = Rational.makeUnsafe(1n, 10n ** 9n);

export const partsPerBillion = (r: Rational.Rational) =>
  make(Rational.multiply(r, fractionPerPartPerBillion));

export const inPartsPerBillion = (d: DimensionlessExact) =>
  Rational.divideUnsafe(d.value, fractionPerPartPerBillion);

/**
 * The rest of the whole: `complement(percent(30))` is exactly `percent(70)`.
 * Values outside 0–100% are not rejected—the complement of 150% is -50%.
 */
export const complement = (d: DimensionlessExact): DimensionlessExact =>
  make(Rational.subtract(Rational.one, d.value));
