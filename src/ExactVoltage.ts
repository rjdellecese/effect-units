import * as ExactQuantity from "./ExactQuantity.ts";
import * as Rational from "./Rational.ts";
import * as Voltage from "./Voltage.ts";

export type ExactVoltage = ExactQuantity.ExactQuantity<Voltage.Volts>;

export const ExactVoltage = ExactQuantity.ExactQuantity(Voltage.Volts);
export const ExactVoltageFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Voltage.Volts,
);

const make = (value: Rational.Rational): ExactVoltage =>
  ExactQuantity.make(Voltage.Volts, value);

export const zero = make(Rational.zero);

export const volts = (r: Rational.Rational) => make(r);

export const inVolts = (v: ExactVoltage) => v.value;
