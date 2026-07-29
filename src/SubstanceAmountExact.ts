import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as SubstanceAmount from "./SubstanceAmount.ts";

export type SubstanceAmountExact =
  QuantityExact.QuantityExact<SubstanceAmount.Moles>;

export const SubstanceAmountExact = QuantityExact.QuantityExact(
  SubstanceAmount.Moles,
);
export const SubstanceAmountExactFromStruct =
  QuantityExact.QuantityExactFromStruct(SubstanceAmount.Moles);

const make = (value: Rational.Rational): SubstanceAmountExact =>
  QuantityExact.make(SubstanceAmount.Moles, value);

export const zero = make(Rational.zero);

export const moles = (r: Rational.Rational) => make(r);

export const inMoles = (s: SubstanceAmountExact) => s.value;

export const picomoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Pico", r));

export const inPicomoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Pico", s.value);

export const nanomoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Nano", r));

export const inNanomoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Nano", s.value);

export const micromoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Micro", r));

export const inMicromoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Micro", s.value);

export const millimoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Milli", r));

export const inMillimoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Milli", s.value);

export const centimoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Centi", r));

export const inCentimoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Centi", s.value);

export const decimoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Deci", r));

export const inDecimoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Deci", s.value);

export const kilomoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilomoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Kilo", s.value);

export const megamoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Mega", r));

export const inMegamoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Mega", s.value);

export const gigamoles = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Giga", r));

export const inGigamoles = (s: SubstanceAmountExact) =>
  PrefixExact.toPrefixed("Giga", s.value);
