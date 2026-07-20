import * as Current from "./Current.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";
import * as Voltage from "./Voltage.ts";

export type Ohms = Unit.Rate<Voltage.Volts, Current.Amperes>;
export const Ohms: Ohms = Unit.rate(Voltage.Volts, Current.Amperes);

export type Resistance = Quantity.Quantity<Ohms>;

export const Resistance = Quantity.Quantity(Ohms);
export const ResistanceFromSelf = Quantity.QuantityFromSelf(Ohms);

const make = (value: number): Resistance => Quantity.make(Ohms, value);

export const zero = make(0);

export const ohms = (n: number) => make(n);

export const inOhms = (r: Resistance) => r.value;
