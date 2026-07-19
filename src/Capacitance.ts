import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Farads = "Farads";
export const Farads: Farads = "Farads";

export type Capacitance = Quantity.Quantity<Farads>;

export const Capacitance = Quantity.Quantity(Farads);
export const CapacitanceFromSelf = Quantity.QuantityFromSelf(Farads);

const make = (value: number): Capacitance => Quantity.make(Farads, value);

export const zero = make(0);

export const farads = (n: number) => make(n);

export const inFarads = (c: Capacitance) => c.value;

export const picofarads = (n: number) => make(Prefix.toBase("Pico", n));

export const inPicofarads = (c: Capacitance) =>
  Prefix.toPrefixed("Pico", c.value);

export const nanofarads = (n: number) => make(Prefix.toBase("Nano", n));

export const inNanofarads = (c: Capacitance) =>
  Prefix.toPrefixed("Nano", c.value);

export const microfarads = (n: number) => make(Prefix.toBase("Micro", n));

export const inMicrofarads = (c: Capacitance) =>
  Prefix.toPrefixed("Micro", c.value);
