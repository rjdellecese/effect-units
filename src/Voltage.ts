import * as BigDecimal from "effect/BigDecimal";

import * as Current from "./Current";
import * as Power from "./Power";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Volts = Unit.Rate<Power.Watts, Current.Amperes>;
export const Volts: Volts = Unit.rate(Power.Watts, Current.Amperes);

export type Voltage = Quantity.Quantity<Volts>;

export const Voltage = Quantity.Quantity(Volts);
export const VoltageFromSelf = Quantity.QuantityFromSelf(Volts);

const make = (value: BigDecimal.BigDecimal): Voltage =>
  Quantity.make(Volts, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const volts = (n: BigDecimal.BigDecimal) => make(n);

export const inVolts = (v: Voltage) => v.value;
