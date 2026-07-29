import * as Angle from "./Angle.ts";
import * as Duration from "./Duration.ts";
import * as Constants from "./internal/constants.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

export type RadiansPerSecond = Unit.Rate<Angle.Radians, Duration.Seconds>;
export const RadiansPerSecond: RadiansPerSecond = Unit.rate(
  Angle.Radians,
  Duration.Seconds,
);

export type AngularSpeed = Quantity.Quantity<RadiansPerSecond>;

export const AngularSpeed = Quantity.Quantity(RadiansPerSecond);
export const AngularSpeedFromStruct =
  Quantity.QuantityFromStruct(RadiansPerSecond);

const make = (value: number): AngularSpeed =>
  Quantity.make(RadiansPerSecond, value);

export const zero = make(0);

export const radiansPerSecond = (n: number) => make(n);

export const inRadiansPerSecond = (s: AngularSpeed) => s.value;

const radiansPerDegree = Math.PI / 180;

export const degreesPerSecond = (n: number) => make(n * radiansPerDegree);

export const inDegreesPerSecond = (s: AngularSpeed) =>
  s.value / radiansPerDegree;

const radiansPerTurn = 2 * Math.PI;

export const turnsPerSecond = (n: number) => make(n * radiansPerTurn);

export const inTurnsPerSecond = (s: AngularSpeed) => s.value / radiansPerTurn;

const radiansPerSecondPerTurnPerMinute =
  radiansPerTurn / Constants.secondsPerMinute;

export const turnsPerMinute = (n: number) =>
  make(n * radiansPerSecondPerTurnPerMinute);

export const inTurnsPerMinute = (s: AngularSpeed) =>
  s.value / radiansPerSecondPerTurnPerMinute;

/** One revolution is one turn. */
export const revolutionsPerSecond = (n: number) => make(n * radiansPerTurn);

export const inRevolutionsPerSecond = (s: AngularSpeed) =>
  s.value / radiansPerTurn;

export const revolutionsPerMinute = (n: number) =>
  make(n * radiansPerSecondPerTurnPerMinute);

export const inRevolutionsPerMinute = (s: AngularSpeed) =>
  s.value / radiansPerSecondPerTurnPerMinute;
