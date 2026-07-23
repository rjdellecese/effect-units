import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Molarity from "./Molarity.ts";
import * as Rational from "./Rational.ts";

export type ExactMolarity =
  ExactQuantity.ExactQuantity<Molarity.MolesPerCubicMeter>;

export const ExactMolarity = ExactQuantity.ExactQuantity(
  Molarity.MolesPerCubicMeter,
);
export const ExactMolarityFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Molarity.MolesPerCubicMeter,
);

const make = (value: Rational.Rational): ExactMolarity =>
  ExactQuantity.make(Molarity.MolesPerCubicMeter, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const molesPerCubicMeter = (r: Rational.Rational) => make(r);

export const inMolesPerCubicMeter = (m: ExactMolarity) => m.value;

const molesPerCubicMeterPerMolePerLiter = Rational.make(1000n);

export const molesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMolePerLiter));

export const inMolesPerLiter = (m: ExactMolarity) =>
  Rational.unsafeDivide(m.value, molesPerCubicMeterPerMolePerLiter);

const molesPerCubicMeterPerDecimolePerLiter = ExactPrefix.toBase(
  "Deci",
  molesPerCubicMeterPerMolePerLiter,
);

export const decimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerDecimolePerLiter));

export const inDecimolesPerLiter = (m: ExactMolarity) =>
  Rational.unsafeDivide(m.value, molesPerCubicMeterPerDecimolePerLiter);

const molesPerCubicMeterPerCentimolePerLiter = ExactPrefix.toBase(
  "Centi",
  molesPerCubicMeterPerMolePerLiter,
);

export const centimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerCentimolePerLiter));

export const inCentimolesPerLiter = (m: ExactMolarity) =>
  Rational.unsafeDivide(m.value, molesPerCubicMeterPerCentimolePerLiter);

const molesPerCubicMeterPerMillimolePerLiter = ExactPrefix.toBase(
  "Milli",
  molesPerCubicMeterPerMolePerLiter,
);

export const millimolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMillimolePerLiter));

export const inMillimolesPerLiter = (m: ExactMolarity) =>
  Rational.unsafeDivide(m.value, molesPerCubicMeterPerMillimolePerLiter);

const molesPerCubicMeterPerMicromolePerLiter = ExactPrefix.toBase(
  "Micro",
  molesPerCubicMeterPerMolePerLiter,
);

export const micromolesPerLiter = (r: Rational.Rational) =>
  make(Rational.multiply(r, molesPerCubicMeterPerMicromolePerLiter));

export const inMicromolesPerLiter = (m: ExactMolarity) =>
  Rational.unsafeDivide(m.value, molesPerCubicMeterPerMicromolePerLiter);
