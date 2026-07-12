import * as BigDecimal from "effect/BigDecimal";
import * as Option from "effect/Option";

import { pi } from "./internal/constants";
import * as Quantity from "./Quantity";

export type Radians = "Radians";
export const Radians: Radians = "Radians";

export type Angle = Quantity.Quantity<Radians>;

export const Angle = Quantity.Quantity(Radians);
export const AngleFromSelf = Quantity.QuantityFromSelf(Radians);

const make = (value: BigDecimal.BigDecimal): Angle =>
  Quantity.make(Radians, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const radians = (n: BigDecimal.BigDecimal) => make(n);

export const inRadians = (a: Angle) => a.value;

const radiansPerTurn = BigDecimal.multiply(pi, BigDecimal.fromBigInt(2n));

export const turns = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerTurn));

export const inTurns = (a: Angle) =>
  BigDecimal.unsafeDivide(a.value, radiansPerTurn);

const radiansPerDegree = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(180n),
);

export const degrees = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerDegree));

export const inDegrees = (a: Angle) =>
  BigDecimal.unsafeDivide(a.value, radiansPerDegree);

const radiansPerArcminute = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(10800n),
);

/** One minute of arc is 1/60 of a degree. */
export const minutes = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerArcminute));

export const inMinutes = (a: Angle) =>
  BigDecimal.unsafeDivide(a.value, radiansPerArcminute);

const radiansPerArcsecond = BigDecimal.unsafeDivide(
  pi,
  BigDecimal.fromBigInt(648000n),
);

/** One second of arc is 1/60 of a minute of arc. */
export const seconds = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, radiansPerArcsecond));

export const inSeconds = (a: Angle) =>
  BigDecimal.unsafeDivide(a.value, radiansPerArcsecond);

// Degrees, minutes, seconds

export type Sign = "Positive" | "Negative";

const arcsecondsPerDegree = BigDecimal.fromBigInt(3600n);
const arcsecondsPerArcminute = BigDecimal.fromBigInt(60n);

export const fromDms = ({
  sign,
  degrees: wholeDegrees,
  minutes: wholeMinutes,
  seconds: dmsSeconds,
}: {
  readonly sign: Sign;
  readonly degrees: bigint;
  readonly minutes: bigint;
  readonly seconds: BigDecimal.BigDecimal;
}): Angle => {
  const totalArcseconds = BigDecimal.sum(
    BigDecimal.fromBigInt(wholeDegrees * 3600n + wholeMinutes * 60n),
    dmsSeconds,
  );
  const magnitude = BigDecimal.multiply(totalArcseconds, radiansPerArcsecond);

  return make(sign === "Positive" ? magnitude : BigDecimal.negate(magnitude));
};

const toBigInt = (n: BigDecimal.BigDecimal): bigint => {
  const truncated = BigDecimal.normalize(BigDecimal.truncate(n));

  return truncated.scale <= 0
    ? truncated.value * 10n ** BigInt(-truncated.scale)
    : truncated.value / 10n ** BigInt(truncated.scale);
};

export const toDms = (
  a: Angle,
): {
  readonly sign: Sign;
  readonly degrees: bigint;
  readonly minutes: bigint;
  readonly seconds: BigDecimal.BigDecimal;
} => {
  const totalArcseconds = BigDecimal.unsafeDivide(
    BigDecimal.abs(a.value),
    radiansPerArcsecond,
  );
  const wholeDegrees = toBigInt(
    BigDecimal.unsafeDivide(totalArcseconds, arcsecondsPerDegree),
  );
  const remainingArcseconds = BigDecimal.subtract(
    totalArcseconds,
    BigDecimal.fromBigInt(wholeDegrees * 3600n),
  );
  const wholeMinutes = toBigInt(
    BigDecimal.unsafeDivide(remainingArcseconds, arcsecondsPerArcminute),
  );

  return {
    sign: BigDecimal.isNegative(a.value) ? "Negative" : "Positive",
    degrees: wholeDegrees,
    minutes: wholeMinutes,
    seconds: BigDecimal.subtract(
      remainingArcseconds,
      BigDecimal.fromBigInt(wholeMinutes * 60n),
    ),
  };
};

// Trigonometry
//
// Trigonometric functions are computed via 64-bit floats (`Math.*`), so they
// are lossy: results carry roughly 15 significant digits of precision.

export const sin = (a: Angle): BigDecimal.BigDecimal =>
  BigDecimal.unsafeFromNumber(Math.sin(BigDecimal.unsafeToNumber(a.value)));

export const cos = (a: Angle): BigDecimal.BigDecimal =>
  BigDecimal.unsafeFromNumber(Math.cos(BigDecimal.unsafeToNumber(a.value)));

export const tan = (a: Angle): BigDecimal.BigDecimal =>
  BigDecimal.unsafeFromNumber(Math.tan(BigDecimal.unsafeToNumber(a.value)));

/** Returns `Option.none()` when the input is outside `[-1, 1]`. */
export const asin = (n: BigDecimal.BigDecimal): Option.Option<Angle> => {
  const result = Math.asin(BigDecimal.unsafeToNumber(n));

  return Number.isNaN(result)
    ? Option.none()
    : Option.some(make(BigDecimal.unsafeFromNumber(result)));
};

/** Returns `Option.none()` when the input is outside `[-1, 1]`. */
export const acos = (n: BigDecimal.BigDecimal): Option.Option<Angle> => {
  const result = Math.acos(BigDecimal.unsafeToNumber(n));

  return Number.isNaN(result)
    ? Option.none()
    : Option.some(make(BigDecimal.unsafeFromNumber(result)));
};

export const atan = (n: BigDecimal.BigDecimal): Angle =>
  make(BigDecimal.unsafeFromNumber(Math.atan(BigDecimal.unsafeToNumber(n))));

export const atan2 = (
  y: BigDecimal.BigDecimal,
  x: BigDecimal.BigDecimal,
): Angle =>
  make(
    BigDecimal.unsafeFromNumber(
      Math.atan2(BigDecimal.unsafeToNumber(y), BigDecimal.unsafeToNumber(x)),
    ),
  );

/**
 * Normalizes an angle into the range `(-π, π]` (up to the precision of the
 * library's π constant).
 */
export const normalize = (a: Angle): Angle => {
  const remainder = BigDecimal.unsafeRemainder(a.value, radiansPerTurn);

  return make(
    BigDecimal.greaterThan(remainder, pi)
      ? BigDecimal.subtract(remainder, radiansPerTurn)
      : BigDecimal.lessThanOrEqualTo(remainder, BigDecimal.negate(pi))
        ? BigDecimal.sum(remainder, radiansPerTurn)
        : remainder,
  );
};
