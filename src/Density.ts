import * as BigDecimal from "effect/BigDecimal";

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

const make = (value: BigDecimal.BigDecimal): Density =>
  Quantity.make(KilogramsPerCubicMeter, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const kilogramsPerCubicMeter = (n: BigDecimal.BigDecimal) => make(n);

export const inKilogramsPerCubicMeter = (d: Density) => d.value;

const kilogramsPerCubicMeterPerGramPerCubicCentimeter =
  BigDecimal.fromBigInt(1000n);

export const gramsPerCubicCentimeter = (n: BigDecimal.BigDecimal) =>
  make(
    BigDecimal.multiply(n, kilogramsPerCubicMeterPerGramPerCubicCentimeter),
  );

export const inGramsPerCubicCentimeter = (d: Density) =>
  BigDecimal.unsafeDivide(
    d.value,
    kilogramsPerCubicMeterPerGramPerCubicCentimeter,
  );

/**
 * One pound per cubic inch, as a non-terminating ratio, is precomputed once
 * (rounded at 100 significant digits) and used symmetrically, keeping
 * roundtrips exact.
 */
const kilogramsPerCubicMeterPerPoundPerCubicInch = BigDecimal.unsafeDivide(
  BigDecimal.make(45359237n, 8),
  BigDecimal.make(16387064n, 12),
);

export const poundsPerCubicInch = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerCubicMeterPerPoundPerCubicInch));

export const inPoundsPerCubicInch = (d: Density) =>
  BigDecimal.unsafeDivide(
    d.value,
    kilogramsPerCubicMeterPerPoundPerCubicInch,
  );

/**
 * One pound per cubic foot, as a non-terminating ratio, is precomputed once
 * (rounded at 100 significant digits) and used symmetrically, keeping
 * roundtrips exact.
 */
const kilogramsPerCubicMeterPerPoundPerCubicFoot = BigDecimal.unsafeDivide(
  BigDecimal.make(45359237n, 8),
  BigDecimal.make(28316846592n, 12),
);

export const poundsPerCubicFoot = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerCubicMeterPerPoundPerCubicFoot));

export const inPoundsPerCubicFoot = (d: Density) =>
  BigDecimal.unsafeDivide(
    d.value,
    kilogramsPerCubicMeterPerPoundPerCubicFoot,
  );
