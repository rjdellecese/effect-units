import * as BigDecimal from "effect/BigDecimal";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Moles = "Moles";
export const Moles: Moles = "Moles";

export type SubstanceAmount = Quantity.Quantity<Moles>;

export const SubstanceAmount = Quantity.Quantity(Moles);
export const SubstanceAmountFromSelf = Quantity.QuantityFromSelf(Moles);

const make = (value: BigDecimal.BigDecimal): SubstanceAmount =>
  Quantity.make(Moles, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const moles = (n: BigDecimal.BigDecimal) => make(n);

export const inMoles = (s: SubstanceAmount) => s.value;

export const picomoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Pico", n));

export const inPicomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Pico", s.value);

export const nanomoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Nano", n));

export const inNanomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Nano", s.value);

export const micromoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Micro", n));

export const inMicromoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Micro", s.value);

export const millimoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMillimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Milli", s.value);

export const centimoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Centi", n));

export const inCentimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Centi", s.value);

export const decimoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Deci", n));

export const inDecimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Deci", s.value);

export const kilomoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Kilo", s.value);

export const megamoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Mega", n));

export const inMegamoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Mega", s.value);

export const gigamoles = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Giga", n));

export const inGigamoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Giga", s.value);
