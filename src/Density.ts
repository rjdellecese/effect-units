import * as BigDecimal from "effect/BigDecimal";

import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";
import * as Volume from "./Volume";

export type KilogramsPerCubicMeter = Unit.Rate<Mass.Grams, Volume.CubicMeters>;
export const KilogramsPerCubicMeter: KilogramsPerCubicMeter = Unit.rate(
  Mass.Grams,
  Volume.CubicMeters,
);

export type Density = Quantity.Quantity<KilogramsPerCubicMeter>;

export const Density = Quantity.Quantity(KilogramsPerCubicMeter);
export const DensityFromSelf = Quantity.QuantityFromSelf(
  KilogramsPerCubicMeter,
);

const make = (value: BigDecimal.BigDecimal): Density =>
  Quantity.make(KilogramsPerCubicMeter, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Because the library's mass base unit is grams (not kilograms), one kilogram
// per cubic meter is 1000 base units (g/m³).
const baseUnitsPerKilogramPerCubicMeter = BigDecimal.fromBigInt(1000n);

export const kilogramsPerCubicMeter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilogramPerCubicMeter));

export const inKilogramsPerCubicMeter = (d: Density) =>
  BigDecimal.unsafeDivide(d.value, baseUnitsPerKilogramPerCubicMeter);

const baseUnitsPerGramPerCubicCentimeter = BigDecimal.fromBigInt(1_000_000n);

export const gramsPerCubicCentimeter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerGramPerCubicCentimeter));

export const inGramsPerCubicCentimeter = (d: Density) =>
  BigDecimal.unsafeDivide(d.value, baseUnitsPerGramPerCubicCentimeter);

/**
 * One pound per cubic inch, as a non-terminating ratio, is precomputed once
 * (rounded at 100 significant digits) and used symmetrically, keeping
 * roundtrips exact.
 */
const baseUnitsPerPoundPerCubicInch = BigDecimal.unsafeDivide(
  BigDecimal.make(45359237n, 5),
  BigDecimal.make(16387064n, 12),
);

export const poundsPerCubicInch = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPoundPerCubicInch));

export const inPoundsPerCubicInch = (d: Density) =>
  BigDecimal.unsafeDivide(d.value, baseUnitsPerPoundPerCubicInch);

/**
 * One pound per cubic foot, as a non-terminating ratio, is precomputed once
 * (rounded at 100 significant digits) and used symmetrically, keeping
 * roundtrips exact.
 */
const baseUnitsPerPoundPerCubicFoot = BigDecimal.unsafeDivide(
  BigDecimal.make(45359237n, 5),
  BigDecimal.make(28316846592n, 12),
);

export const poundsPerCubicFoot = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPoundPerCubicFoot));

export const inPoundsPerCubicFoot = (d: Density) =>
  BigDecimal.unsafeDivide(d.value, baseUnitsPerPoundPerCubicFoot);
