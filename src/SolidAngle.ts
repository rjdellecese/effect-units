import * as Angle from "./Angle.js";
import * as Quantity from "./Quantity.js";

export type Steradians = "Steradians";
export const Steradians: Steradians = "Steradians";

export type SolidAngle = Quantity.Quantity<Steradians>;

export const SolidAngle = Quantity.Quantity(Steradians);
export const SolidAngleFromSelf = Quantity.QuantityFromSelf(Steradians);

const make = (value: number): SolidAngle => Quantity.make(Steradians, value);

export const zero = make(0);

export const steradians = (n: number) => make(n);

export const inSteradians = (s: SolidAngle) => s.value;

/** One spat is 4π steradians, the solid angle of a full sphere. */
const steradiansPerSpat = 4 * Math.PI;

export const spats = (n: number) => make(n * steradiansPerSpat);

export const inSpats = (s: SolidAngle) => s.value / steradiansPerSpat;

/** One square degree is (π/180)² steradians. */
const steradiansPerSquareDegree = (Math.PI / 180) * (Math.PI / 180);

export const squareDegrees = (n: number) => make(n * steradiansPerSquareDegree);

export const inSquareDegrees = (s: SolidAngle) =>
  s.value / steradiansPerSquareDegree;

/** The solid angle of a cone with the given apex angle. */
export const conical = (angle: Angle.Angle): SolidAngle =>
  make(2 * Math.PI * (1 - Math.cos(Angle.inRadians(angle) / 2)));

/** The solid angle of a rectangular pyramid with the given apex angles. */
export const pyramidal = (a: Angle.Angle, b: Angle.Angle): SolidAngle =>
  make(
    4 *
      Math.asin(
        Math.sin(Angle.inRadians(a) / 2) * Math.sin(Angle.inRadians(b) / 2),
      ),
  );
