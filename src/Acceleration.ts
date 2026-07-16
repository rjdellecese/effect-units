import * as Duration from "./Duration";
import * as Constants from "./internal/constants";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";
import * as Unit from "./Unit";

export type MetersPerSecondSquared = Unit.Rate<
  Speed.MetersPerSecond,
  Duration.Seconds
>;
export const MetersPerSecondSquared: MetersPerSecondSquared = Unit.rate(
  Speed.MetersPerSecond,
  Duration.Seconds,
);

export type Acceleration = Quantity.Quantity<MetersPerSecondSquared>;

export const Acceleration = Quantity.Quantity(MetersPerSecondSquared);
export const AccelerationFromSelf = Quantity.QuantityFromSelf(
  MetersPerSecondSquared,
);

const make = (value: number): Acceleration =>
  Quantity.make(MetersPerSecondSquared, value);

export const zero = make(0);

export const metersPerSecondSquared = (n: number) => make(n);

export const inMetersPerSecondSquared = (a: Acceleration) => a.value;

export const feetPerSecondSquared = (n: number) =>
  make(n * Constants.metersPerFoot);

export const inFeetPerSecondSquared = (a: Acceleration) =>
  a.value / Constants.metersPerFoot;

/** One gee is the standard acceleration due to gravity. */
export const gees = (n: number) => make(n * Constants.gee);

export const inGees = (a: Acceleration) => a.value / Constants.gee;
