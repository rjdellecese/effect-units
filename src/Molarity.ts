import * as BigDecimal from "effect/BigDecimal";

import * as Quantity from "./Quantity";
import * as SubstanceAmount from "./SubstanceAmount";
import * as Unit from "./Unit";
import * as Volume from "./Volume";

export type MolesPerCubicMeter = Unit.Rate<
  SubstanceAmount.Moles,
  Volume.CubicMeters
>;
export const MolesPerCubicMeter: MolesPerCubicMeter = Unit.rate(
  SubstanceAmount.Moles,
  Volume.CubicMeters,
);

export type Molarity = Quantity.Quantity<MolesPerCubicMeter>;

export const Molarity = Quantity.Quantity(MolesPerCubicMeter);
export const MolarityFromSelf = Quantity.QuantityFromSelf(MolesPerCubicMeter);

const make = (value: BigDecimal.BigDecimal): Molarity =>
  Quantity.make(MolesPerCubicMeter, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const molesPerCubicMeter = (n: BigDecimal.BigDecimal) => make(n);

export const inMolesPerCubicMeter = (m: Molarity) => m.value;

const molesPerCubicMeterPerMolePerLiter = BigDecimal.fromBigInt(1000n);

export const molesPerLiter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, molesPerCubicMeterPerMolePerLiter));

export const inMolesPerLiter = (m: Molarity) =>
  BigDecimal.unsafeDivide(m.value, molesPerCubicMeterPerMolePerLiter);

const molesPerCubicMeterPerDecimolePerLiter = BigDecimal.fromBigInt(100n);

export const decimolesPerLiter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, molesPerCubicMeterPerDecimolePerLiter));

export const inDecimolesPerLiter = (m: Molarity) =>
  BigDecimal.unsafeDivide(m.value, molesPerCubicMeterPerDecimolePerLiter);

const molesPerCubicMeterPerCentimolePerLiter = BigDecimal.fromBigInt(10n);

export const centimolesPerLiter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, molesPerCubicMeterPerCentimolePerLiter));

export const inCentimolesPerLiter = (m: Molarity) =>
  BigDecimal.unsafeDivide(m.value, molesPerCubicMeterPerCentimolePerLiter);

export const millimolesPerLiter = (n: BigDecimal.BigDecimal) => make(n);

export const inMillimolesPerLiter = (m: Molarity) => m.value;

const molesPerCubicMeterPerMicromolePerLiter = BigDecimal.make(1n, 3);

export const micromolesPerLiter = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, molesPerCubicMeterPerMicromolePerLiter));

export const inMicromolesPerLiter = (m: Molarity) =>
  BigDecimal.unsafeDivide(m.value, molesPerCubicMeterPerMicromolePerLiter);
