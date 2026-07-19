import * as Charge from "./Charge";
import * as Duration from "./Duration";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Amperes = Unit.Rate<Charge.Coulombs, Duration.Seconds>;
export const Amperes: Amperes = Unit.rate(Charge.Coulombs, Duration.Seconds);

export type Current = Quantity.Quantity<Amperes>;

export const Current = Quantity.Quantity(Amperes);
export const CurrentFromSelf = Quantity.QuantityFromSelf(Amperes);

const make = (value: number): Current => Quantity.make(Amperes, value);

export const zero = make(0);

export const amperes = (n: number) => make(n);

export const inAmperes = (c: Current) => c.value;

export const milliamperes = (n: number) => make(Prefix.toBase("Milli", n));

export const inMilliamperes = (c: Current) =>
  Prefix.toPrefixed("Milli", c.value);
