import * as Constants from "./internal/constants.ts";
import * as Mass from "./Mass.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";
import * as Volume from "./Volume.ts";

export type KilogramsPerCubicMeter = Unit.Rate<
  Mass.Kilograms,
  Volume.CubicMeters
>;
export const KilogramsPerCubicMeter: KilogramsPerCubicMeter = Unit.rate(
  Mass.Kilograms,
  Volume.CubicMeters,
);

export type Density = Quantity.Quantity<KilogramsPerCubicMeter>;

export const Density = Quantity.Quantity(KilogramsPerCubicMeter);
export const DensityFromStruct = Quantity.QuantityFromStruct(
  KilogramsPerCubicMeter,
);

const make = (value: number): Density =>
  Quantity.make(KilogramsPerCubicMeter, value);

export const zero = make(0);

export const kilogramsPerCubicMeter = (n: number) => make(n);

export const inKilogramsPerCubicMeter = (d: Density) => d.value;

/**
 * A gram is a milli-kilogram; a cubic centimeter is a centi-meter cubed—
 * exactly 1000 kg/m^3. A literal rather than a prefix-factor quotient,
 * which evaluates to 999.9999999999999.
 */
const kilogramsPerCubicMeterPerGramPerCubicCentimeter = 1000;

export const gramsPerCubicCentimeter = (n: number) =>
  make(n * kilogramsPerCubicMeterPerGramPerCubicCentimeter);

export const inGramsPerCubicCentimeter = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerGramPerCubicCentimeter;

/**
 * Exactly 56,699,046,250/2,048,383 kg/m^3 (the pound and cubed-inch
 * definitions combined into one reduced fraction), written as one division
 * of exact integers so the factor is correctly rounded—chaining the
 * already-rounded constants would land one ulp off.
 */
const kilogramsPerCubicMeterPerPoundPerCubicInch = 56_699_046_250 / 2_048_383;

export const poundsPerCubicInch = (n: number) =>
  make(n * kilogramsPerCubicMeterPerPoundPerCubicInch);

export const inPoundsPerCubicInch = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerPoundPerCubicInch;

const kilogramsPerCubicMeterPerPoundPerCubicFoot =
  Constants.kilogramsPerPound /
  (Constants.metersPerFoot * Constants.metersPerFoot * Constants.metersPerFoot);

export const poundsPerCubicFoot = (n: number) =>
  make(n * kilogramsPerCubicMeterPerPoundPerCubicFoot);

export const inPoundsPerCubicFoot = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerPoundPerCubicFoot;
