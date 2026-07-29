/**
 * Dimensionless quantities: pure numbers with a scale attached, stored as a
 * fraction, so `one` is 100%, 1,000 per mille, and 10,000 basis points alike.
 *
 * Percentages are the reason to reach for this module. A bare `number` says
 * nothing about which scale it is on—the classic 0.5-versus-50 bug—while a
 * `Dimensionless` names the scale at every boundary and carries the unit into
 * the wire format.
 *
 * Ratios of two quantities in the same units land here (`Quantity.ratio`),
 * and because `Unitless` is the multiplicative identity of the unit algebra,
 * `Quantity.times` and `over` apply one without leaving the units they scale.
 *
 * @module
 */
import * as Quantity from "./Quantity.ts";

export type Unitless = "Unitless";
export const Unitless: Unitless = "Unitless";

export type Dimensionless = Quantity.Quantity<Unitless>;

export const Dimensionless = Quantity.Quantity(Unitless);
export const DimensionlessFromStruct = Quantity.QuantityFromStruct(Unitless);

const make = (value: number): Dimensionless => Quantity.make(Unitless, value);

export const zero = make(0);

/** A factor of one: the identity for `Quantity.times`, and 100%. */
export const one = make(1);

export const fraction = (n: number) => make(n);

export const inFraction = (d: Dimensionless) => d.value;

/** One percent (%) is 10⁻², the SI centi- prefix applied to the unit one. */
const fractionPerPercent = 1e-2;

export const percent = (n: number) => make(n * fractionPerPercent);

export const inPercent = (d: Dimensionless) => d.value / fractionPerPercent;

/** One per mille (‰) is 10⁻³, a tenth of a percent. */
const fractionPerPerMille = 1e-3;

export const perMille = (n: number) => make(n * fractionPerPerMille);

export const inPerMille = (d: Dimensionless) => d.value / fractionPerPerMille;

/** One basis point (bp) is 10⁻⁴, a hundredth of a percent. */
const fractionPerBasisPoint = 1e-4;

export const basisPoints = (n: number) => make(n * fractionPerBasisPoint);

export const inBasisPoints = (d: Dimensionless) =>
  d.value / fractionPerBasisPoint;

/** One part per million (ppm) is 10⁻⁶. */
const fractionPerPartPerMillion = 1e-6;

export const partsPerMillion = (n: number) =>
  make(n * fractionPerPartPerMillion);

export const inPartsPerMillion = (d: Dimensionless) =>
  d.value / fractionPerPartPerMillion;

/** One part per billion (ppb) is 10⁻⁹, on the short scale. */
const fractionPerPartPerBillion = 1e-9;

export const partsPerBillion = (n: number) =>
  make(n * fractionPerPartPerBillion);

export const inPartsPerBillion = (d: Dimensionless) =>
  d.value / fractionPerPartPerBillion;

/**
 * The rest of the whole: `complement(percent(30))` is `percent(70)`. Values
 * outside 0–100% are not rejected—the complement of 150% is -50%.
 */
export const complement = (d: Dimensionless): Dimensionless =>
  make(1 - d.value);
