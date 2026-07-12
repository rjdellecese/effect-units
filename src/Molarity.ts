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

const make = (value: number): Molarity =>
  Quantity.make(MolesPerCubicMeter, value);

export const zero = make(0);

export const molesPerCubicMeter = (n: number) => make(n);

export const inMolesPerCubicMeter = (m: Molarity) => m.value;

const molesPerCubicMeterPerMolePerLiter = 1000;

export const molesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerMolePerLiter);

export const inMolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerMolePerLiter;

const molesPerCubicMeterPerDecimolePerLiter = 100;

export const decimolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerDecimolePerLiter);

export const inDecimolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerDecimolePerLiter;

const molesPerCubicMeterPerCentimolePerLiter = 10;

export const centimolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerCentimolePerLiter);

export const inCentimolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerCentimolePerLiter;

export const millimolesPerLiter = (n: number) => make(n);

export const inMillimolesPerLiter = (m: Molarity) => m.value;

const molesPerCubicMeterPerMicromolePerLiter = 0.001;

export const micromolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerMicromolePerLiter);

export const inMicromolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerMicromolePerLiter;
