import * as BigDecimal from "effect/BigDecimal";

import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type CubicMeters = Unit.Cubed<Length.Meters>;
export const CubicMeters: CubicMeters = Unit.cubed(Length.Meters);

export type Volume = Quantity.Quantity<CubicMeters>;

export const Volume = Quantity.Quantity(CubicMeters);
export const VolumeFromSelf = Quantity.QuantityFromSelf(CubicMeters);

const make = (value: BigDecimal.BigDecimal): Volume =>
  Quantity.make(CubicMeters, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const cubicMeters = (n: BigDecimal.BigDecimal) => make(n);

export const inCubicMeters = (v: Volume) => v.value;

const cubicMetersPerLiter = BigDecimal.make(1n, 3);

export const liters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerLiter));

export const inLiters = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerLiter);

const cubicMetersPerMilliliter = BigDecimal.make(1n, 6);

export const milliliters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerMilliliter));

export const inMilliliters = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerMilliliter);

export const cubicCentimeters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerMilliliter));

export const inCubicCentimeters = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerMilliliter);

// Imperial

const cubicMetersPerCubicInch = BigDecimal.make(16387064n, 12);

export const cubicInches = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerCubicInch));

export const inCubicInches = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerCubicInch);

const cubicMetersPerCubicFoot = BigDecimal.make(28316846592n, 12);

export const cubicFeet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerCubicFoot));

export const inCubicFeet = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerCubicFoot);

const cubicMetersPerCubicYard = BigDecimal.make(764554857984n, 12);

export const cubicYards = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerCubicYard));

export const inCubicYards = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerCubicYard);

// US liquid

const cubicMetersPerUsLiquidGallon = BigDecimal.make(3785411784n, 12);

export const usLiquidGallons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsLiquidGallon));

export const inUsLiquidGallons = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsLiquidGallon);

const cubicMetersPerUsLiquidQuart = BigDecimal.make(946352946n, 12);

export const usLiquidQuarts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsLiquidQuart));

export const inUsLiquidQuarts = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsLiquidQuart);

const cubicMetersPerUsLiquidPint = BigDecimal.make(473176473n, 12);

export const usLiquidPints = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsLiquidPint));

export const inUsLiquidPints = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsLiquidPint);

/** One US fluid ounce is 1/128 of a US liquid gallon. */
const cubicMetersPerUsFluidOunce = BigDecimal.make(295735295625n, 16);

export const usFluidOunces = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsFluidOunce));

export const inUsFluidOunces = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsFluidOunce);

// US dry

const cubicMetersPerUsDryGallon = BigDecimal.make(440488377086n, 14);

export const usDryGallons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsDryGallon));

export const inUsDryGallons = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsDryGallon);

const cubicMetersPerUsDryQuart = BigDecimal.make(1101220942715n, 15);

export const usDryQuarts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsDryQuart));

export const inUsDryQuarts = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsDryQuart);

const cubicMetersPerUsDryPint = BigDecimal.make(5506104713575n, 16);

export const usDryPints = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerUsDryPint));

export const inUsDryPints = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerUsDryPint);

// Imperial (UK)

const cubicMetersPerImperialGallon = BigDecimal.make(454609n, 8);

export const imperialGallons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerImperialGallon));

export const inImperialGallons = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerImperialGallon);

const cubicMetersPerImperialQuart = BigDecimal.make(11365225n, 10);

export const imperialQuarts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerImperialQuart));

export const inImperialQuarts = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerImperialQuart);

const cubicMetersPerImperialPint = BigDecimal.make(56826125n, 11);

export const imperialPints = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerImperialPint));

export const inImperialPints = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerImperialPint);

/** One imperial fluid ounce is 1/160 of an imperial gallon. */
const cubicMetersPerImperialFluidOunce = BigDecimal.make(284130625n, 13);

export const imperialFluidOunces = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, cubicMetersPerImperialFluidOunce));

export const inImperialFluidOunces = (v: Volume) =>
  BigDecimal.unsafeDivide(v.value, cubicMetersPerImperialFluidOunce);
