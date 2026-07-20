import * as Constants from "./internal/constants.ts";
import * as Mass from "./Mass.ts";
import * as Prefix from "./Prefix.ts";
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
export const DensityFromSelf = Quantity.QuantityFromSelf(
  KilogramsPerCubicMeter,
);

const make = (value: number): Density =>
  Quantity.make(KilogramsPerCubicMeter, value);

export const zero = make(0);

export const kilogramsPerCubicMeter = (n: number) => make(n);

export const inKilogramsPerCubicMeter = (d: Density) => d.value;

/** A gram is a milli-kilogram; a cubic centimeter is a centi-meter cubed. */
const kilogramsPerCubicMeterPerGramPerCubicCentimeter =
  Prefix.toBase("Milli", 1) / Prefix.toBase("Centi", 1) ** 3;

export const gramsPerCubicCentimeter = (n: number) =>
  make(n * kilogramsPerCubicMeterPerGramPerCubicCentimeter);

export const inGramsPerCubicCentimeter = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerGramPerCubicCentimeter;

const kilogramsPerCubicMeterPerPoundPerCubicInch =
  Constants.kilogramsPerPound /
  (Constants.metersPerInch * Constants.metersPerInch * Constants.metersPerInch);

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
