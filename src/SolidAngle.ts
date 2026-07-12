import * as BigDecimal from "effect/BigDecimal";
import * as Option from "effect/Option";

import * as Angle from "./Angle";
import { pi } from "./internal/constants";
import * as Quantity from "./Quantity";

export type Steradians = "Steradians";
export const Steradians: Steradians = "Steradians";

export type SolidAngle = Quantity.Quantity<Steradians>;

export const SolidAngle = Quantity.Quantity(Steradians);
export const SolidAngleFromSelf = Quantity.QuantityFromSelf(Steradians);

const make = (value: BigDecimal.BigDecimal): SolidAngle =>
  Quantity.make(Steradians, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const steradians = (n: BigDecimal.BigDecimal) => make(n);

export const inSteradians = (s: SolidAngle) => s.value;

/** One spat is 4π steradians, the solid angle of a full sphere. */
const steradiansPerSpat = BigDecimal.multiply(pi, BigDecimal.fromBigInt(4n));

export const spats = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, steradiansPerSpat));

export const inSpats = (s: SolidAngle) =>
  BigDecimal.unsafeDivide(s.value, steradiansPerSpat);

/** One square degree is (π/180)² steradians. */
const radiansPerDegree = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(180n),
);
const steradiansPerSquareDegree = BigDecimal.multiply(
  radiansPerDegree,
  radiansPerDegree,
);

export const squareDegrees = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, steradiansPerSquareDegree));

export const inSquareDegrees = (s: SolidAngle) =>
  BigDecimal.unsafeDivide(s.value, steradiansPerSquareDegree);

const one = BigDecimal.fromBigInt(1n);
const two = BigDecimal.fromBigInt(2n);
const twoPi = BigDecimal.multiply(pi, two);

/**
 * The solid angle of a cone with the given apex angle. Lossy, since it is
 * computed via float trigonometry.
 */
export const conical = (angle: Angle.Angle): SolidAngle =>
  make(
    BigDecimal.multiply(
      twoPi,
      BigDecimal.subtract(
        one,
        Angle.cos(
          Angle.radians(BigDecimal.unsafeDivide(Angle.inRadians(angle), two)),
        ),
      ),
    ),
  );

/**
 * The solid angle of a rectangular pyramid with the given apex angles. Lossy,
 * since it is computed via float trigonometry.
 */
export const pyramidal = (
  a: Angle.Angle,
  b: Angle.Angle,
): SolidAngle => {
  const halfAngleSin = (angle: Angle.Angle) =>
    Angle.sin(
      Angle.radians(BigDecimal.unsafeDivide(Angle.inRadians(angle), two)),
    );

  return make(
    BigDecimal.multiply(
      BigDecimal.fromBigInt(4n),
      Angle.inRadians(
        Option.getOrThrow(
          Angle.asin(BigDecimal.multiply(halfAngleSin(a), halfAngleSin(b))),
        ),
      ),
    ),
  );
};
