import * as Constants from "./internal/constants.js";
import * as Length from "./Length.js";
import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";

export type CubicMeters = Unit.Cubed<Length.Meters>;
export const CubicMeters: CubicMeters = Unit.cubed(Length.Meters);

export type Volume = Quantity.Quantity<CubicMeters>;

export const Volume = Quantity.Quantity(CubicMeters);
export const VolumeFromSelf = Quantity.QuantityFromSelf(CubicMeters);

const make = (value: number): Volume => Quantity.make(CubicMeters, value);

export const zero = make(0);

// Metric

export const cubicMeters = (n: number) => make(n);

export const inCubicMeters = (v: Volume) => v.value;

const cubicMetersPerLiter = 0.001;

export const liters = (n: number) => make(n * cubicMetersPerLiter);

export const inLiters = (v: Volume) => v.value / cubicMetersPerLiter;

const cubicMetersPerMilliliter = Prefix.toBase("Milli", cubicMetersPerLiter);

export const milliliters = (n: number) => make(n * cubicMetersPerMilliliter);

export const inMilliliters = (v: Volume) => v.value / cubicMetersPerMilliliter;

export const cubicCentimeters = (n: number) =>
  make(n * cubicMetersPerMilliliter);

export const inCubicCentimeters = (v: Volume) =>
  v.value / cubicMetersPerMilliliter;

// Imperial

const cubicMetersPerCubicInch =
  Constants.metersPerInch * Constants.metersPerInch * Constants.metersPerInch;

export const cubicInches = (n: number) => make(n * cubicMetersPerCubicInch);

export const inCubicInches = (v: Volume) => v.value / cubicMetersPerCubicInch;

const cubicMetersPerCubicFoot =
  Constants.metersPerFoot * Constants.metersPerFoot * Constants.metersPerFoot;

export const cubicFeet = (n: number) => make(n * cubicMetersPerCubicFoot);

export const inCubicFeet = (v: Volume) => v.value / cubicMetersPerCubicFoot;

const cubicMetersPerCubicYard =
  Constants.metersPerYard * Constants.metersPerYard * Constants.metersPerYard;

export const cubicYards = (n: number) => make(n * cubicMetersPerCubicYard);

export const inCubicYards = (v: Volume) => v.value / cubicMetersPerCubicYard;

// US liquid

const cubicMetersPerUsLiquidGallon = 0.003785411784;

export const usLiquidGallons = (n: number) =>
  make(n * cubicMetersPerUsLiquidGallon);

export const inUsLiquidGallons = (v: Volume) =>
  v.value / cubicMetersPerUsLiquidGallon;

const cubicMetersPerUsLiquidQuart = cubicMetersPerUsLiquidGallon / 4;

export const usLiquidQuarts = (n: number) =>
  make(n * cubicMetersPerUsLiquidQuart);

export const inUsLiquidQuarts = (v: Volume) =>
  v.value / cubicMetersPerUsLiquidQuart;

const cubicMetersPerUsLiquidPint = cubicMetersPerUsLiquidGallon / 8;

export const usLiquidPints = (n: number) =>
  make(n * cubicMetersPerUsLiquidPint);

export const inUsLiquidPints = (v: Volume) =>
  v.value / cubicMetersPerUsLiquidPint;

/** One US fluid ounce is 1/128 of a US liquid gallon. */
const cubicMetersPerUsFluidOunce = cubicMetersPerUsLiquidGallon / 128;

export const usFluidOunces = (n: number) =>
  make(n * cubicMetersPerUsFluidOunce);

export const inUsFluidOunces = (v: Volume) =>
  v.value / cubicMetersPerUsFluidOunce;

// US dry

const cubicMetersPerUsDryGallon = 0.00440488377086;

export const usDryGallons = (n: number) => make(n * cubicMetersPerUsDryGallon);

export const inUsDryGallons = (v: Volume) =>
  v.value / cubicMetersPerUsDryGallon;

const cubicMetersPerUsDryQuart = cubicMetersPerUsDryGallon / 4;

export const usDryQuarts = (n: number) => make(n * cubicMetersPerUsDryQuart);

export const inUsDryQuarts = (v: Volume) => v.value / cubicMetersPerUsDryQuart;

const cubicMetersPerUsDryPint = cubicMetersPerUsDryGallon / 8;

export const usDryPints = (n: number) => make(n * cubicMetersPerUsDryPint);

export const inUsDryPints = (v: Volume) => v.value / cubicMetersPerUsDryPint;

// Imperial (UK)

const cubicMetersPerImperialGallon = 0.00454609;

export const imperialGallons = (n: number) =>
  make(n * cubicMetersPerImperialGallon);

export const inImperialGallons = (v: Volume) =>
  v.value / cubicMetersPerImperialGallon;

const cubicMetersPerImperialQuart = cubicMetersPerImperialGallon / 4;

export const imperialQuarts = (n: number) =>
  make(n * cubicMetersPerImperialQuart);

export const inImperialQuarts = (v: Volume) =>
  v.value / cubicMetersPerImperialQuart;

const cubicMetersPerImperialPint = cubicMetersPerImperialGallon / 8;

export const imperialPints = (n: number) =>
  make(n * cubicMetersPerImperialPint);

export const inImperialPints = (v: Volume) =>
  v.value / cubicMetersPerImperialPint;

/** One imperial fluid ounce is 1/160 of an imperial gallon. */
const cubicMetersPerImperialFluidOunce = cubicMetersPerImperialGallon / 160;

export const imperialFluidOunces = (n: number) =>
  make(n * cubicMetersPerImperialFluidOunce);

export const inImperialFluidOunces = (v: Volume) =>
  v.value / cubicMetersPerImperialFluidOunce;
