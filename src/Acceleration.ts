import * as BigDecimal from "effect/BigDecimal";

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

const make = (value: BigDecimal.BigDecimal): Acceleration =>
  Quantity.make(MetersPerSecondSquared, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const metersPerSecondSquared = (n: BigDecimal.BigDecimal) => make(n);

export const inMetersPerSecondSquared = (a: Acceleration) => a.value;

const metersPerFoot = BigDecimal.make(3048n, 4);

export const feetPerSecondSquared = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerFoot));

export const inFeetPerSecondSquared = (a: Acceleration) =>
  BigDecimal.unsafeDivide(a.value, metersPerFoot);

/** One gee is 9.80665 m/s², the standard acceleration due to gravity. */
const metersPerSecondSquaredPerGee = BigDecimal.make(980665n, 5);

export const gees = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerSecondSquaredPerGee));

export const inGees = (a: Acceleration) =>
  BigDecimal.unsafeDivide(a.value, metersPerSecondSquaredPerGee);
