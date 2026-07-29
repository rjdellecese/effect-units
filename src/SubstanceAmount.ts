import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";

export type Moles = "Moles";
export const Moles: Moles = "Moles";

export type SubstanceAmount = Quantity.Quantity<Moles>;

export const SubstanceAmount = Quantity.Quantity(Moles);
export const SubstanceAmountFromStruct = Quantity.QuantityFromStruct(Moles);

const make = (value: number): SubstanceAmount => Quantity.make(Moles, value);

export const zero = make(0);

export const moles = (n: number) => make(n);

export const inMoles = (s: SubstanceAmount) => s.value;

export const picomoles = (n: number) => make(Prefix.toBase("Pico", n));

export const inPicomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Pico", s.value);

export const nanomoles = (n: number) => make(Prefix.toBase("Nano", n));

export const inNanomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Nano", s.value);

export const micromoles = (n: number) => make(Prefix.toBase("Micro", n));

export const inMicromoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Micro", s.value);

export const millimoles = (n: number) => make(Prefix.toBase("Milli", n));

export const inMillimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Milli", s.value);

export const centimoles = (n: number) => make(Prefix.toBase("Centi", n));

export const inCentimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Centi", s.value);

export const decimoles = (n: number) => make(Prefix.toBase("Deci", n));

export const inDecimoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Deci", s.value);

export const kilomoles = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilomoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Kilo", s.value);

export const megamoles = (n: number) => make(Prefix.toBase("Mega", n));

export const inMegamoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Mega", s.value);

export const gigamoles = (n: number) => make(Prefix.toBase("Giga", n));

export const inGigamoles = (s: SubstanceAmount) =>
  Prefix.toPrefixed("Giga", s.value);
