import * as Inductance from "./Inductance.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type InductanceExact = QuantityExact.QuantityExact<Inductance.Henries>;

export const InductanceExact = QuantityExact.QuantityExact(Inductance.Henries);
export const InductanceExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Inductance.Henries,
);

const make = (value: Rational.Rational): InductanceExact =>
  QuantityExact.make(Inductance.Henries, value);

export const zero = make(Rational.zero);

export const henries = (r: Rational.Rational) => make(r);

export const inHenries = (i: InductanceExact) => i.value;

export const nanohenries = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Nano", r));

export const inNanohenries = (i: InductanceExact) =>
  PrefixExact.toPrefixed("Nano", i.value);

export const microhenries = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Micro", r));

export const inMicrohenries = (i: InductanceExact) =>
  PrefixExact.toPrefixed("Micro", i.value);

export const millihenries = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Milli", r));

export const inMillihenries = (i: InductanceExact) =>
  PrefixExact.toPrefixed("Milli", i.value);

export const kilohenries = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilohenries = (i: InductanceExact) =>
  PrefixExact.toPrefixed("Kilo", i.value);
