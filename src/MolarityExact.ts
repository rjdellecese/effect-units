import * as PrefixExact from "./internal/prefixExact.ts";
import * as Molarity from "./Molarity.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type MolarityExact =
  QuantityExact.QuantityExact<Molarity.MolesPerCubicMeter>;

export const MolarityExact = QuantityExact.QuantityExact(
  Molarity.MolesPerCubicMeter,
);
export const MolarityExactFromStruct = QuantityExact.QuantityExactFromStruct(
  Molarity.MolesPerCubicMeter,
);

const make = (value: Rational.Rational): MolarityExact =>
  QuantityExact.make(Molarity.MolesPerCubicMeter, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const molesPerCubicMeter = (r: Rational.Rational) => make(r);

export const inMolesPerCubicMeter = (m: MolarityExact) => m.value;

const molesPerCubicMeterPerMolePerLiter = Rational.makeUnsafe(1000n);

export const molesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMolePerLiter));

export const inMolesPerLiter = (m: MolarityExact) =>
  Rational.divideUnsafe(m.value, molesPerCubicMeterPerMolePerLiter);

const molesPerCubicMeterPerDecimolePerLiter = PrefixExact.toBase(
  "Deci",
  molesPerCubicMeterPerMolePerLiter,
);

export const decimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerDecimolePerLiter));

export const inDecimolesPerLiter = (m: MolarityExact) =>
  Rational.divideUnsafe(m.value, molesPerCubicMeterPerDecimolePerLiter);

const molesPerCubicMeterPerCentimolePerLiter = PrefixExact.toBase(
  "Centi",
  molesPerCubicMeterPerMolePerLiter,
);

export const centimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerCentimolePerLiter));

export const inCentimolesPerLiter = (m: MolarityExact) =>
  Rational.divideUnsafe(m.value, molesPerCubicMeterPerCentimolePerLiter);

const molesPerCubicMeterPerMillimolePerLiter = PrefixExact.toBase(
  "Milli",
  molesPerCubicMeterPerMolePerLiter,
);

export const millimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMillimolePerLiter));

export const inMillimolesPerLiter = (m: MolarityExact) =>
  Rational.divideUnsafe(m.value, molesPerCubicMeterPerMillimolePerLiter);

const molesPerCubicMeterPerMicromolePerLiter = PrefixExact.toBase(
  "Micro",
  molesPerCubicMeterPerMolePerLiter,
);

export const micromolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMicromolePerLiter));

export const inMicromolesPerLiter = (m: MolarityExact) =>
  Rational.divideUnsafe(m.value, molesPerCubicMeterPerMicromolePerLiter);
