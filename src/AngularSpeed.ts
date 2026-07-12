import * as BigDecimal from "effect/BigDecimal";

import * as Angle from "./Angle";
import * as Duration from "./Duration";
import { pi } from "./internal/constants";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type RadiansPerSecond = Unit.Rate<Angle.Radians, Duration.Seconds>;
export const RadiansPerSecond: RadiansPerSecond = Unit.rate(
  Angle.Radians,
  Duration.Seconds,
);

export type AngularSpeed = Quantity.Quantity<RadiansPerSecond>;

export const AngularSpeed = Quantity.Quantity(RadiansPerSecond);
export const AngularSpeedFromSelf =
  Quantity.QuantityFromSelf(RadiansPerSecond);

const make = (value: BigDecimal.BigDecimal): AngularSpeed =>
  Quantity.make(RadiansPerSecond, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const radiansPerSecond = (n: BigDecimal.BigDecimal) => make(n);

export const inRadiansPerSecond = (s: AngularSpeed) => s.value;

const radiansPerDegree = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(180n),
);

export const degreesPerSecond = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerDegree));

export const inDegreesPerSecond = (s: AngularSpeed) =>
  BigDecimal.unsafeDivide(s.value, radiansPerDegree);

const radiansPerTurn = BigDecimal.multiply(pi, BigDecimal.fromBigInt(2n));

export const turnsPerSecond = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerTurn));

export const inTurnsPerSecond = (s: AngularSpeed) =>
  BigDecimal.unsafeDivide(s.value, radiansPerTurn);

const radiansPerSecondPerTurnPerMinute = BigDecimal.unsafeDivide(
  radiansPerTurn,
  BigDecimal.fromBigInt(60n),
);

export const turnsPerMinute = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerSecondPerTurnPerMinute));

export const inTurnsPerMinute = (s: AngularSpeed) =>
  BigDecimal.unsafeDivide(s.value, radiansPerSecondPerTurnPerMinute);

/** One revolution is one turn. */
export const revolutionsPerSecond = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerTurn));

export const inRevolutionsPerSecond = (s: AngularSpeed) =>
  BigDecimal.unsafeDivide(s.value, radiansPerTurn);

export const revolutionsPerMinute = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerSecondPerTurnPerMinute));

export const inRevolutionsPerMinute = (s: AngularSpeed) =>
  BigDecimal.unsafeDivide(s.value, radiansPerSecondPerTurnPerMinute);
