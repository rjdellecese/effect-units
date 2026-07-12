import * as BigDecimal from "effect/BigDecimal";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Henries = "Henries";
export const Henries: Henries = "Henries";

export type Inductance = Quantity.Quantity<Henries>;

export const Inductance = Quantity.Quantity(Henries);
export const InductanceFromSelf = Quantity.QuantityFromSelf(Henries);

const make = (value: BigDecimal.BigDecimal): Inductance =>
  Quantity.make(Henries, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const henries = (n: BigDecimal.BigDecimal) => make(n);

export const inHenries = (i: Inductance) => i.value;

export const nanohenries = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Nano", n));

export const inNanohenries = (i: Inductance) =>
  Prefix.toPrefixed("Nano", i.value);

export const microhenries = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Micro", n));

export const inMicrohenries = (i: Inductance) =>
  Prefix.toPrefixed("Micro", i.value);

export const millihenries = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMillihenries = (i: Inductance) =>
  Prefix.toPrefixed("Milli", i.value);

export const kilohenries = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilohenries = (i: Inductance) =>
  Prefix.toPrefixed("Kilo", i.value);
