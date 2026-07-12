import * as BigDecimal from "effect/BigDecimal";

import * as Current from "./Current";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";
import * as Voltage from "./Voltage";

export type Ohms = Unit.Rate<Voltage.Volts, Current.Amperes>;
export const Ohms: Ohms = Unit.rate(Voltage.Volts, Current.Amperes);

export type Resistance = Quantity.Quantity<Ohms>;

export const Resistance = Quantity.Quantity(Ohms);
export const ResistanceFromSelf = Quantity.QuantityFromSelf(Ohms);

const make = (value: BigDecimal.BigDecimal): Resistance =>
  Quantity.make(Ohms, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const ohms = (n: BigDecimal.BigDecimal) => make(n);

export const inOhms = (r: Resistance) => r.value;
