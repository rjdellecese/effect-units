import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Voltage from "./Voltage.ts";

export type VoltageExact = QuantityExact.QuantityExact<Voltage.Volts>;

export const VoltageExact = QuantityExact.QuantityExact(Voltage.Volts);
export const VoltageExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Voltage.Volts,
);

const make = (value: Rational.Rational): VoltageExact =>
  QuantityExact.make(Voltage.Volts, value);

export const zero = make(Rational.zero);

export const volts = (r: Rational.Rational) => make(r);

export const inVolts = (v: VoltageExact) => v.value;
