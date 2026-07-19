import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";

export type Henries = "Henries";
export const Henries: Henries = "Henries";

export type Inductance = Quantity.Quantity<Henries>;

export const Inductance = Quantity.Quantity(Henries);
export const InductanceFromSelf = Quantity.QuantityFromSelf(Henries);

const make = (value: number): Inductance => Quantity.make(Henries, value);

export const zero = make(0);

export const henries = (n: number) => make(n);

export const inHenries = (i: Inductance) => i.value;

export const nanohenries = (n: number) => make(Prefix.toBase("Nano", n));

export const inNanohenries = (i: Inductance) =>
  Prefix.toPrefixed("Nano", i.value);

export const microhenries = (n: number) => make(Prefix.toBase("Micro", n));

export const inMicrohenries = (i: Inductance) =>
  Prefix.toPrefixed("Micro", i.value);

export const millihenries = (n: number) => make(Prefix.toBase("Milli", n));

export const inMillihenries = (i: Inductance) =>
  Prefix.toPrefixed("Milli", i.value);

export const kilohenries = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilohenries = (i: Inductance) =>
  Prefix.toPrefixed("Kilo", i.value);
