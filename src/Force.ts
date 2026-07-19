import * as Acceleration from "./Acceleration.js";
import * as Constants from "./internal/constants.js";
import * as Mass from "./Mass.js";
import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";

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

const make = (value: number): Force => Quantity.make(Newtons, value);

export const zero = make(0);

export const newtons = (n: number) => make(n);

export const inNewtons = (f: Force) => f.value;

export const kilonewtons = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilonewtons = (f: Force) => Prefix.toPrefixed("Kilo", f.value);

export const meganewtons = (n: number) => make(Prefix.toBase("Mega", n));

export const inMeganewtons = (f: Force) => Prefix.toPrefixed("Mega", f.value);

const newtonsPerPound = Constants.newtonsPerPoundForce;

export const pounds = (n: number) => make(n * newtonsPerPound);

export const inPounds = (f: Force) => f.value / newtonsPerPound;

/** One kip is 1000 pounds of force. */
const newtonsPerKip = newtonsPerPound * 1000;

export const kips = (n: number) => make(n * newtonsPerKip);

export const inKips = (f: Force) => f.value / newtonsPerKip;
