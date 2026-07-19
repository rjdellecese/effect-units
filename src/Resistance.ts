import * as Current from "./Current.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";
import * as Voltage from "./Voltage.js";

export type Ohms = Unit.Rate<Voltage.Volts, Current.Amperes>;
export const Ohms: Ohms = Unit.rate(Voltage.Volts, Current.Amperes);

export type Resistance = Quantity.Quantity<Ohms>;

export const Resistance = Quantity.Quantity(Ohms);
export const ResistanceFromSelf = Quantity.QuantityFromSelf(Ohms);

const make = (value: number): Resistance => Quantity.make(Ohms, value);

export const zero = make(0);

export const ohms = (n: number) => make(n);

export const inOhms = (r: Resistance) => r.value;
