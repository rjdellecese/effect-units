import * as Capacitance from "./Capacitance.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactCapacitance = ExactQuantity.ExactQuantity<Capacitance.Farads>;

export const ExactCapacitance = ExactQuantity.ExactQuantity(Capacitance.Farads);
export const ExactCapacitanceFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Capacitance.Farads,
);

const make = (value: Rational.Rational): ExactCapacitance =>
  ExactQuantity.make(Capacitance.Farads, value);

export const zero = make(Rational.zero);

export const farads = (r: Rational.Rational) => make(r);

export const inFarads = (c: ExactCapacitance) => c.value;

export const picofarads = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Pico", r));

export const inPicofarads = (c: ExactCapacitance) =>
  ExactPrefix.toPrefixed("Pico", c.value);

export const nanofarads = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Nano", r));

export const inNanofarads = (c: ExactCapacitance) =>
  ExactPrefix.toPrefixed("Nano", c.value);

export const microfarads = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Micro", r));

export const inMicrofarads = (c: ExactCapacitance) =>
  ExactPrefix.toPrefixed("Micro", c.value);
