import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";
import * as SubstanceAmount from "./SubstanceAmount.ts";

export type ExactSubstanceAmount =
  ExactQuantity.ExactQuantity<SubstanceAmount.Moles>;

export const ExactSubstanceAmount = ExactQuantity.ExactQuantity(
  SubstanceAmount.Moles,
);
export const ExactSubstanceAmountFromSelf = ExactQuantity.ExactQuantityFromSelf(
  SubstanceAmount.Moles,
);

const make = (value: Rational.Rational): ExactSubstanceAmount =>
  ExactQuantity.make(SubstanceAmount.Moles, value);

export const zero = make(Rational.zero);

export const moles = (r: Rational.Rational) => make(r);

export const inMoles = (s: ExactSubstanceAmount) => s.value;

export const picomoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Pico", r));

export const inPicomoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Pico", s.value);

export const nanomoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Nano", r));

export const inNanomoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Nano", s.value);

export const micromoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Micro", r));

export const inMicromoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Micro", s.value);

export const millimoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Milli", r));

export const inMillimoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Milli", s.value);

export const centimoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Centi", r));

export const inCentimoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Centi", s.value);

export const decimoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Deci", r));

export const inDecimoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Deci", s.value);

export const kilomoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilomoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Kilo", s.value);

export const megamoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Mega", r));

export const inMegamoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Mega", s.value);

export const gigamoles = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Giga", r));

export const inGigamoles = (s: ExactSubstanceAmount) =>
  ExactPrefix.toPrefixed("Giga", s.value);
