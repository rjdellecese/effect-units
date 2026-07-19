import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type RadiansPerSecondSquared = Unit.Rate<
  AngularSpeed.RadiansPerSecond,
  Duration.Seconds
>;
export const RadiansPerSecondSquared: RadiansPerSecondSquared = Unit.rate(
  AngularSpeed.RadiansPerSecond,
  Duration.Seconds,
);

export type AngularAcceleration = Quantity.Quantity<RadiansPerSecondSquared>;

export const AngularAcceleration = Quantity.Quantity(RadiansPerSecondSquared);
export const AngularAccelerationFromSelf = Quantity.QuantityFromSelf(
  RadiansPerSecondSquared,
);

const make = (value: number): AngularAcceleration =>
  Quantity.make(RadiansPerSecondSquared, value);

export const zero = make(0);

export const radiansPerSecondSquared = (n: number) => make(n);

export const inRadiansPerSecondSquared = (a: AngularAcceleration) => a.value;

const radiansPerDegree = Math.PI / 180;

export const degreesPerSecondSquared = (n: number) =>
  make(n * radiansPerDegree);

export const inDegreesPerSecondSquared = (a: AngularAcceleration) =>
  a.value / radiansPerDegree;

const radiansPerTurn = 2 * Math.PI;

export const turnsPerSecondSquared = (n: number) =>
  make(n * radiansPerTurn);

export const inTurnsPerSecondSquared = (a: AngularAcceleration) =>
  a.value / radiansPerTurn;
