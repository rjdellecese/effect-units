import * as BigDecimal from "effect/BigDecimal";

import * as AngularSpeed from "./AngularSpeed";
import * as Duration from "./Duration";
import { pi } from "./internal/constants";
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

const make = (value: BigDecimal.BigDecimal): AngularAcceleration =>
  Quantity.make(RadiansPerSecondSquared, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const radiansPerSecondSquared = (n: BigDecimal.BigDecimal) => make(n);

export const inRadiansPerSecondSquared = (a: AngularAcceleration) => a.value;

const radiansPerDegree = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(180n),
);

export const degreesPerSecondSquared = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerDegree));

export const inDegreesPerSecondSquared = (a: AngularAcceleration) =>
  BigDecimal.unsafeDivide(a.value, radiansPerDegree);

const radiansPerTurn = BigDecimal.multiply(pi, BigDecimal.fromBigInt(2n));

export const turnsPerSecondSquared = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerTurn));

export const inTurnsPerSecondSquared = (a: AngularAcceleration) =>
  BigDecimal.unsafeDivide(a.value, radiansPerTurn);
