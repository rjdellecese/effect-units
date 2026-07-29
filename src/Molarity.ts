import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";
import * as SubstanceAmount from "./SubstanceAmount.ts";
import * as Unit from "./Unit.ts";
import * as Volume from "./Volume.ts";

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
export const MolarityFromStruct =
  Quantity.QuantityFromStruct(MolesPerCubicMeter);

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

const molesPerCubicMeterPerDecimolePerLiter = Prefix.toBase(
  "Deci",
  molesPerCubicMeterPerMolePerLiter,
);

export const decimolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerDecimolePerLiter);

export const inDecimolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerDecimolePerLiter;

const molesPerCubicMeterPerCentimolePerLiter = Prefix.toBase(
  "Centi",
  molesPerCubicMeterPerMolePerLiter,
);

export const centimolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerCentimolePerLiter);

export const inCentimolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerCentimolePerLiter;

const molesPerCubicMeterPerMillimolePerLiter = Prefix.toBase(
  "Milli",
  molesPerCubicMeterPerMolePerLiter,
);

export const millimolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerMillimolePerLiter);

export const inMillimolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerMillimolePerLiter;

const molesPerCubicMeterPerMicromolePerLiter = Prefix.toBase(
  "Micro",
  molesPerCubicMeterPerMolePerLiter,
);

export const micromolesPerLiter = (n: number) =>
  make(n * molesPerCubicMeterPerMicromolePerLiter);

export const inMicromolesPerLiter = (m: Molarity) =>
  m.value / molesPerCubicMeterPerMicromolePerLiter;
