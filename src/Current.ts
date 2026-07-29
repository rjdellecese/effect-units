import * as Charge from "./Charge.ts";
import * as Duration from "./Duration.ts";
import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

export type Amperes = Unit.Rate<Charge.Coulombs, Duration.Seconds>;
export const Amperes: Amperes = Unit.rate(Charge.Coulombs, Duration.Seconds);

export type Current = Quantity.Quantity<Amperes>;

export const Current = Quantity.Quantity(Amperes);
export const CurrentFromStruct = Quantity.QuantityFromStruct(Amperes);

const make = (value: number): Current => Quantity.make(Amperes, value);

export const zero = make(0);

export const amperes = (n: number) => make(n);

export const inAmperes = (c: Current) => c.value;

export const milliamperes = (n: number) => make(Prefix.toBase("Milli", n));

export const inMilliamperes = (c: Current) =>
  Prefix.toPrefixed("Milli", c.value);
