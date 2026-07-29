import * as Capacitance from "./Capacitance.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type CapacitanceExact = QuantityExact.QuantityExact<Capacitance.Farads>;

export const CapacitanceExact = QuantityExact.QuantityExact(Capacitance.Farads);
export const CapacitanceExactFromStruct = QuantityExact.QuantityExactFromStruct(
  Capacitance.Farads,
);

const make = (value: Rational.Rational): CapacitanceExact =>
  QuantityExact.make(Capacitance.Farads, value);

export const zero = make(Rational.zero);

export const farads = (r: Rational.Rational) => make(r);

export const inFarads = (c: CapacitanceExact) => c.value;

export const picofarads = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Pico", r));

export const inPicofarads = (c: CapacitanceExact) =>
  PrefixExact.toPrefixed("Pico", c.value);

export const nanofarads = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Nano", r));

export const inNanofarads = (c: CapacitanceExact) =>
  PrefixExact.toPrefixed("Nano", c.value);

export const microfarads = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Micro", r));

export const inMicrofarads = (c: CapacitanceExact) =>
  PrefixExact.toPrefixed("Micro", c.value);
