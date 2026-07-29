import * as Density from "./Density.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type DensityExact =
  QuantityExact.QuantityExact<Density.KilogramsPerCubicMeter>;

export const DensityExact = QuantityExact.QuantityExact(
  Density.KilogramsPerCubicMeter,
);
export const DensityExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Density.KilogramsPerCubicMeter,
);

const make = (value: Rational.Rational): DensityExact =>
  QuantityExact.make(Density.KilogramsPerCubicMeter, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

const cube = (r: Rational.Rational): Rational.Rational =>
  Rational.multiply(Rational.multiply(r, r), r);

export const kilogramsPerCubicMeter = (r: Rational.Rational) => make(r);

export const inKilogramsPerCubicMeter = (d: DensityExact) => d.value;

/**
 * A gram is a milli-kilogram; a cubic centimeter is a centi-meter cubed—
 * exactly 1000 kilograms per cubic meter.
 */
const kilogramsPerCubicMeterPerGramPerCubicCentimeter = Rational.divideUnsafe(
  PrefixExact.toBase("Milli", Rational.one),
  cube(PrefixExact.toBase("Centi", Rational.one)),
);

export const gramsPerCubicCentimeter = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerGramPerCubicCentimeter));

export const inGramsPerCubicCentimeter = (d: DensityExact) =>
  Rational.divideUnsafe(
    d.value,
    kilogramsPerCubicMeterPerGramPerCubicCentimeter,
  );

/**
 * One pound per cubic inch is exactly 56699046250/2048383 kilograms per
 * cubic meter.
 */
const kilogramsPerCubicMeterPerPoundPerCubicInch = Rational.divideUnsafe(
  ConstantsExact.kilogramsPerPound,
  cube(ConstantsExact.metersPerInch),
);

export const poundsPerCubicInch = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerPoundPerCubicInch));

export const inPoundsPerCubicInch = (d: DensityExact) =>
  Rational.divideUnsafe(d.value, kilogramsPerCubicMeterPerPoundPerCubicInch);

/**
 * One pound per cubic foot is exactly 28349523125/1769802912 kilograms per
 * cubic meter.
 */
const kilogramsPerCubicMeterPerPoundPerCubicFoot = Rational.divideUnsafe(
  ConstantsExact.kilogramsPerPound,
  cube(ConstantsExact.metersPerFoot),
);

export const poundsPerCubicFoot = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerCubicMeterPerPoundPerCubicFoot));

export const inPoundsPerCubicFoot = (d: DensityExact) =>
  Rational.divideUnsafe(d.value, kilogramsPerCubicMeterPerPoundPerCubicFoot);
