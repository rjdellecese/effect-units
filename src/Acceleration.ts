import * as Duration from "./Duration";
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

const metersPerFoot = 0.3048;

export const feetPerSecondSquared = (n: number) => make(n * metersPerFoot);

export const inFeetPerSecondSquared = (a: Acceleration) =>
  a.value / metersPerFoot;

/** One gee is 9.80665 m/s², the standard acceleration due to gravity. */
const metersPerSecondSquaredPerGee = 9.80665;

export const gees = (n: number) => make(n * metersPerSecondSquaredPerGee);

export const inGees = (a: Acceleration) =>
  a.value / metersPerSecondSquaredPerGee;
