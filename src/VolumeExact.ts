import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Volume from "./Volume.ts";

export type VolumeExact = QuantityExact.QuantityExact<Volume.CubicMeters>;

export const VolumeExact = QuantityExact.QuantityExact(Volume.CubicMeters);
export const VolumeExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Volume.CubicMeters,
);

const make = (value: Rational.Rational): VolumeExact =>
  QuantityExact.make(Volume.CubicMeters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

const cubed = (r: Rational.Rational) =>
  Rational.multiply(Rational.multiply(r, r), r);

// Metric

export const cubicMeters = (r: Rational.Rational) => make(r);

export const inCubicMeters = (v: VolumeExact) => v.value;

const cubicMetersPerLiter = Rational.unsafeMake(1n, 1000n);

export const liters = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerLiter));

export const inLiters = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerLiter);

const cubicMetersPerMilliliter = PrefixExact.toBase(
  "Milli",
  cubicMetersPerLiter,
);

export const milliliters = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerMilliliter));

export const inMilliliters = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerMilliliter);

export const cubicCentimeters = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerMilliliter));

export const inCubicCentimeters = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerMilliliter);

// Imperial

const cubicMetersPerCubicInch = cubed(ConstantsExact.metersPerInch);

export const cubicInches = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerCubicInch));

export const inCubicInches = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerCubicInch);

const cubicMetersPerCubicFoot = cubed(ConstantsExact.metersPerFoot);

export const cubicFeet = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerCubicFoot));

export const inCubicFeet = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerCubicFoot);

const cubicMetersPerCubicYard = cubed(ConstantsExact.metersPerYard);

export const cubicYards = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerCubicYard));

export const inCubicYards = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerCubicYard);

// US liquid

const cubicMetersPerUsLiquidGallon = Rational.unsafeMake(
  3785411784n,
  10n ** 12n,
);

export const usLiquidGallons = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsLiquidGallon));

export const inUsLiquidGallons = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsLiquidGallon);

const cubicMetersPerUsLiquidQuart = Rational.multiply(
  cubicMetersPerUsLiquidGallon,
  Rational.unsafeMake(1n, 4n),
);

export const usLiquidQuarts = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsLiquidQuart));

export const inUsLiquidQuarts = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsLiquidQuart);

const cubicMetersPerUsLiquidPint = Rational.multiply(
  cubicMetersPerUsLiquidGallon,
  Rational.unsafeMake(1n, 8n),
);

export const usLiquidPints = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsLiquidPint));

export const inUsLiquidPints = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsLiquidPint);

/** One US fluid ounce is 1/128 of a US liquid gallon. */
const cubicMetersPerUsFluidOunce = Rational.multiply(
  cubicMetersPerUsLiquidGallon,
  Rational.unsafeMake(1n, 128n),
);

export const usFluidOunces = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsFluidOunce));

export const inUsFluidOunces = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsFluidOunce);

// US dry

const cubicMetersPerUsDryGallon = Rational.unsafeMake(
  440488377086n,
  10n ** 14n,
);

export const usDryGallons = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsDryGallon));

export const inUsDryGallons = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsDryGallon);

const cubicMetersPerUsDryQuart = Rational.multiply(
  cubicMetersPerUsDryGallon,
  Rational.unsafeMake(1n, 4n),
);

export const usDryQuarts = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsDryQuart));

export const inUsDryQuarts = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsDryQuart);

const cubicMetersPerUsDryPint = Rational.multiply(
  cubicMetersPerUsDryGallon,
  Rational.unsafeMake(1n, 8n),
);

export const usDryPints = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerUsDryPint));

export const inUsDryPints = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerUsDryPint);

// Imperial (UK)

const cubicMetersPerImperialGallon = Rational.unsafeMake(454609n, 10n ** 8n);

export const imperialGallons = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerImperialGallon));

export const inImperialGallons = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerImperialGallon);

const cubicMetersPerImperialQuart = Rational.multiply(
  cubicMetersPerImperialGallon,
  Rational.unsafeMake(1n, 4n),
);

export const imperialQuarts = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerImperialQuart));

export const inImperialQuarts = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerImperialQuart);

const cubicMetersPerImperialPint = Rational.multiply(
  cubicMetersPerImperialGallon,
  Rational.unsafeMake(1n, 8n),
);

export const imperialPints = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerImperialPint));

export const inImperialPints = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerImperialPint);

/** One imperial fluid ounce is 1/160 of an imperial gallon. */
const cubicMetersPerImperialFluidOunce = Rational.multiply(
  cubicMetersPerImperialGallon,
  Rational.unsafeMake(1n, 160n),
);

export const imperialFluidOunces = (r: Rational.Rational) =>
  make(Rational.multiply(r, cubicMetersPerImperialFluidOunce));

export const inImperialFluidOunces = (v: VolumeExact) =>
  Rational.unsafeDivide(v.value, cubicMetersPerImperialFluidOunce);
