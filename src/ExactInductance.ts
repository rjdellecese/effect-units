import * as ExactQuantity from "./ExactQuantity.ts";
import * as Inductance from "./Inductance.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactInductance = ExactQuantity.ExactQuantity<Inductance.Henries>;

export const ExactInductance = ExactQuantity.ExactQuantity(Inductance.Henries);
export const ExactInductanceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Inductance.Henries,
);

const make = (value: Rational.Rational): ExactInductance =>
  ExactQuantity.make(Inductance.Henries, value);

export const zero = make(Rational.zero);

export const henries = (r: Rational.Rational) => make(r);

export const inHenries = (i: ExactInductance) => i.value;

export const nanohenries = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Nano", r));

export const inNanohenries = (i: ExactInductance) =>
  ExactPrefix.toPrefixed("Nano", i.value);

export const microhenries = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Micro", r));

export const inMicrohenries = (i: ExactInductance) =>
  ExactPrefix.toPrefixed("Micro", i.value);

export const millihenries = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Milli", r));

export const inMillihenries = (i: ExactInductance) =>
  ExactPrefix.toPrefixed("Milli", i.value);

export const kilohenries = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilohenries = (i: ExactInductance) =>
  ExactPrefix.toPrefixed("Kilo", i.value);
