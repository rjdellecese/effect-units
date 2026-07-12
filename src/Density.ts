import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";
import * as Volume from "./Volume";

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

const kilogramsPerCubicMeterPerGramPerCubicCentimeter = 1000;

export const gramsPerCubicCentimeter = (n: number) =>
  make(n * kilogramsPerCubicMeterPerGramPerCubicCentimeter);

export const inGramsPerCubicCentimeter = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerGramPerCubicCentimeter;

const kilogramsPerCubicMeterPerPoundPerCubicInch =
  0.45359237 / (0.0254 * 0.0254 * 0.0254);

export const poundsPerCubicInch = (n: number) =>
  make(n * kilogramsPerCubicMeterPerPoundPerCubicInch);

export const inPoundsPerCubicInch = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerPoundPerCubicInch;

const kilogramsPerCubicMeterPerPoundPerCubicFoot =
  0.45359237 / (0.3048 * 0.3048 * 0.3048);

export const poundsPerCubicFoot = (n: number) =>
  make(n * kilogramsPerCubicMeterPerPoundPerCubicFoot);

export const inPoundsPerCubicFoot = (d: Density) =>
  d.value / kilogramsPerCubicMeterPerPoundPerCubicFoot;
