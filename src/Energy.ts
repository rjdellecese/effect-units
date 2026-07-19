import * as Force from "./Force";
import * as Constants from "./internal/constants";
import * as Length from "./Length";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Joules = Unit.Product<Force.Newtons, Length.Meters>;
export const Joules: Joules = Unit.product(Force.Newtons, Length.Meters);

export type Energy = Quantity.Quantity<Joules>;

export const Energy = Quantity.Quantity(Joules);
export const EnergyFromSelf = Quantity.QuantityFromSelf(Joules);

const make = (value: number): Energy => Quantity.make(Joules, value);

export const zero = make(0);

export const joules = (n: number) => make(n);

export const inJoules = (e: Energy) => e.value;

export const kilojoules = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilojoules = (e: Energy) => Prefix.toPrefixed("Kilo", e.value);

export const megajoules = (n: number) => make(Prefix.toBase("Mega", n));

export const inMegajoules = (e: Energy) => Prefix.toPrefixed("Mega", e.value);

/** One kilowatt hour is one kilowatt (1000 joules per second) for one hour. */
const wattsPerKilowatt = 1000;
const joulesPerKilowattHour = wattsPerKilowatt * Constants.secondsPerHour;

export const kilowattHours = (n: number) => make(n * joulesPerKilowattHour);

export const inKilowattHours = (e: Energy) => e.value / joulesPerKilowattHour;
