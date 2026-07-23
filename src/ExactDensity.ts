import * as Density from "./Density.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactDensity =
  ExactQuantity.ExactQuantity<Density.KilogramsPerCubicMeter>;

export const ExactDensity = ExactQuantity.ExactQuantity(
  Density.KilogramsPerCubicMeter,
);
export const ExactDensityFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Density.KilogramsPerCubicMeter,
);

const make = (value: Rational.Rational): ExactDensity =>
  ExactQuantity.make(Density.KilogramsPerCubicMeter, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

const cube = (r: Rational.Rational): Rational.Rational =>
  Rational.multiply(Rational.multiply(r, r), r);

export const kilogramsPerCubicMeter = (r: Rational.Rational) => make(r);

export const inKilogramsPerCubicMeter = (d: ExactDensity) => d.value;

/**
 * A gram is a milli-kilogram; a cubic centimeter is a centi-meter cubed —
 * exactly 1000 kilograms per cubic meter.
 */
const kilogramsPerCubicMeterPerGramPerCubicCentimeter = Rational.unsafeDivide(
  ExactPrefix.toBase("Milli", Rational.one),
  cube(ExactPrefix.toBase("Centi", Rational.one)),
);

export const gramsPerCubicCentimeter = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerGramPerCubicCentimeter));

export const inGramsPerCubicCentimeter = (d: ExactDensity) =>
  Rational.unsafeDivide(
    d.value,
    kilogramsPerCubicMeterPerGramPerCubicCentimeter,
  );

/**
 * One pound per cubic inch is exactly 56699046250/2048383 kilograms per
 * cubic meter.
 */
const kilogramsPerCubicMeterPerPoundPerCubicInch = Rational.unsafeDivide(
  ExactConstants.kilogramsPerPound,
  cube(ExactConstants.metersPerInch),
);

export const poundsPerCubicInch = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerPoundPerCubicInch));

export const inPoundsPerCubicInch = (d: ExactDensity) =>
  Rational.unsafeDivide(d.value, kilogramsPerCubicMeterPerPoundPerCubicInch);

/**
 * One pound per cubic foot is exactly 28349523125/1769802912 kilograms per
 * cubic meter.
 */
const kilogramsPerCubicMeterPerPoundPerCubicFoot = Rational.unsafeDivide(
  ExactConstants.kilogramsPerPound,
  cube(ExactConstants.metersPerFoot),
);

export const poundsPerCubicFoot = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerPoundPerCubicFoot));

export const inPoundsPerCubicFoot = (d: ExactDensity) =>
  Rational.unsafeDivide(d.value, kilogramsPerCubicMeterPerPoundPerCubicFoot);
