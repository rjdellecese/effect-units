import * as Current from "./Current.ts";
import * as Power from "./Power.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

export type Volts = Unit.Rate<Power.Watts, Current.Amperes>;
export const Volts: Volts = Unit.rate(Power.Watts, Current.Amperes);

export type Voltage = Quantity.Quantity<Volts>;

export const Voltage = Quantity.Quantity(Volts);
export const VoltageFromStruct = Quantity.QuantityFromStruct(Volts);

const make = (value: number): Voltage => Quantity.make(Volts, value);

export const zero = make(0);

export const volts = (n: number) => make(n);

export const inVolts = (v: Voltage) => v.value;
