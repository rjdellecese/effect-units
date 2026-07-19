import * as Quantity from "./Quantity.js";

export type Radians = "Radians";
export const Radians: Radians = "Radians";

export type Angle = Quantity.Quantity<Radians>;

export const Angle = Quantity.Quantity(Radians);
export const AngleFromSelf = Quantity.QuantityFromSelf(Radians);

const make = (value: number): Angle => Quantity.make(Radians, value);

export const zero = make(0);

export const radians = (n: number) => make(n);

export const inRadians = (a: Angle) => a.value;

const radiansPerTurn = 2 * Math.PI;

export const turns = (n: number) => make(n * radiansPerTurn);

export const inTurns = (a: Angle) => a.value / radiansPerTurn;

const radiansPerDegree = Math.PI / 180;

export const degrees = (n: number) => make(n * radiansPerDegree);

export const inDegrees = (a: Angle) => a.value / radiansPerDegree;

/** One minute of arc is 1/60 of a degree. */
const radiansPerArcminute = Math.PI / 10800;

export const minutes = (n: number) => make(n * radiansPerArcminute);

export const inMinutes = (a: Angle) => a.value / radiansPerArcminute;

/** One second of arc is 1/60 of a minute of arc. */
const radiansPerArcsecond = Math.PI / 648000;

export const seconds = (n: number) => make(n * radiansPerArcsecond);

export const inSeconds = (a: Angle) => a.value / radiansPerArcsecond;

// Degrees, minutes, seconds

export type Sign = "Positive" | "Negative";

export const fromDms = ({
  sign,
  degrees: wholeDegrees,
  minutes: wholeMinutes,
  seconds: dmsSeconds,
}: {
  readonly sign: Sign;
  readonly degrees: number;
  readonly minutes: number;
  readonly seconds: number;
}): Angle => {
  const totalArcseconds = wholeDegrees * 3600 + wholeMinutes * 60 + dmsSeconds;
  const magnitude = totalArcseconds * radiansPerArcsecond;

  return make(sign === "Positive" ? magnitude : -magnitude);
};

export const toDms = (
  a: Angle,
): {
  readonly sign: Sign;
  readonly degrees: number;
  readonly minutes: number;
  readonly seconds: number;
} => {
  const totalArcseconds = Math.abs(a.value) / radiansPerArcsecond;
  const wholeDegrees = Math.floor(totalArcseconds / 3600);
  const remainingArcseconds = totalArcseconds - wholeDegrees * 3600;
  const wholeMinutes = Math.floor(remainingArcseconds / 60);

  return {
    sign: a.value < 0 ? "Negative" : "Positive",
    degrees: wholeDegrees,
    minutes: wholeMinutes,
    seconds: remainingArcseconds - wholeMinutes * 60,
  };
};

// Trigonometry

export const sin = (a: Angle): number => Math.sin(a.value);

export const cos = (a: Angle): number => Math.cos(a.value);

export const tan = (a: Angle): number => Math.tan(a.value);

/** NaN when the input is outside `[-1, 1]`. */
export const asin = (n: number): Angle => make(Math.asin(n));

/** NaN when the input is outside `[-1, 1]`. */
export const acos = (n: number): Angle => make(Math.acos(n));

export const atan = (n: number): Angle => make(Math.atan(n));

export const atan2 = (y: number, x: number): Angle => make(Math.atan2(y, x));

/** Normalizes an angle into the range `(-π, π]`. */
export const normalize = (a: Angle): Angle => {
  const remainder = a.value % radiansPerTurn;

  return make(
    remainder > Math.PI
      ? remainder - radiansPerTurn
      : remainder <= -Math.PI
        ? remainder + radiansPerTurn
        : remainder,
  );
};
