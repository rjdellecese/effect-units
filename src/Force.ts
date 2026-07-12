import * as BigDecimal from "effect/BigDecimal";

import * as Acceleration from "./Acceleration";
import * as Mass from "./Mass";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Newtons = Unit.Product<
  Mass.Kilograms,
  Acceleration.MetersPerSecondSquared
>;
export const Newtons: Newtons = Unit.product(
  Mass.Kilograms,
  Acceleration.MetersPerSecondSquared,
);

export type Force = Quantity.Quantity<Newtons>;

export const Force = Quantity.Quantity(Newtons);
export const ForceFromSelf = Quantity.QuantityFromSelf(Newtons);

const make = (value: BigDecimal.BigDecimal): Force =>
  Quantity.make(Newtons, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const newtons = (n: BigDecimal.BigDecimal) => make(n);

export const inNewtons = (f: Force) => f.value;

export const kilonewtons = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilonewtons = (f: Force) => Prefix.toPrefixed("Kilo", f.value);

export const meganewtons = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Mega", n));

export const inMeganewtons = (f: Force) => Prefix.toPrefixed("Mega", f.value);

/** One pound of force is 0.45359237 kg times 9.80665 m/s², exactly. */
const newtonsPerPound = BigDecimal.make(44482216152605n, 13);

export const pounds = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, newtonsPerPound));

export const inPounds = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, newtonsPerPound);

/** One kip is 1000 pounds of force. */
const newtonsPerKip = BigDecimal.make(44482216152605n, 10);

export const kips = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, newtonsPerKip));

export const inKips = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, newtonsPerKip);
