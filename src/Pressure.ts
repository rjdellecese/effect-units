import * as Area from "./Area.ts";
import * as Force from "./Force.ts";
import * as Constants from "./internal/constants.ts";
import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

export type Pascals = Unit.Rate<Force.Newtons, Area.SquareMeters>;
export const Pascals: Pascals = Unit.rate(Force.Newtons, Area.SquareMeters);

export type Pressure = Quantity.Quantity<Pascals>;

export const Pressure = Quantity.Quantity(Pascals);
export const PressureFromSelf = Quantity.QuantityFromSelf(Pascals);

const make = (value: number): Pressure => Quantity.make(Pascals, value);

export const zero = make(0);

export const pascals = (n: number) => make(n);

export const inPascals = (p: Pressure) => p.value;

export const kilopascals = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilopascals = (p: Pressure) =>
  Prefix.toPrefixed("Kilo", p.value);

export const megapascals = (n: number) => make(Prefix.toBase("Mega", n));

export const inMegapascals = (p: Pressure) =>
  Prefix.toPrefixed("Mega", p.value);

/** One pound per square inch is one pound of force per square inch. */
const pascalsPerPoundPerSquareInch =
  Constants.newtonsPerPoundForce /
  (Constants.metersPerInch * Constants.metersPerInch);

export const poundsPerSquareInch = (n: number) =>
  make(n * pascalsPerPoundPerSquareInch);

export const inPoundsPerSquareInch = (p: Pressure) =>
  p.value / pascalsPerPoundPerSquareInch;

/** One standard atmosphere is 101325 pascals. */
const pascalsPerAtmosphere = 101_325;

export const atmospheres = (n: number) => make(n * pascalsPerAtmosphere);

export const inAtmospheres = (p: Pressure) => p.value / pascalsPerAtmosphere;
