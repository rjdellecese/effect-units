import * as BigDecimal from "effect/BigDecimal";

import * as Acceleration from "./Acceleration";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Newtons = Unit.Product<
  Mass.Grams,
  Acceleration.MetersPerSecondSquared
>;
export const Newtons: Newtons = Unit.product(
  Mass.Grams,
  Acceleration.MetersPerSecondSquared,
);

export type Force = Quantity.Quantity<Newtons>;

export const Force = Quantity.Quantity(Newtons);
export const ForceFromSelf = Quantity.QuantityFromSelf(Newtons);

const make = (value: BigDecimal.BigDecimal): Force =>
  Quantity.make(Newtons, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Because the library's mass base unit is grams (not kilograms), one newton
// is 1000 base units (g·m/s²).
const baseUnitsPerNewton = BigDecimal.fromBigInt(1000n);

export const newtons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerNewton));

export const inNewtons = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, baseUnitsPerNewton);

const baseUnitsPerKilonewton = BigDecimal.fromBigInt(1_000_000n);

export const kilonewtons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilonewton));

export const inKilonewtons = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, baseUnitsPerKilonewton);

const baseUnitsPerMeganewton = BigDecimal.fromBigInt(1_000_000_000n);

export const meganewtons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMeganewton));

export const inMeganewtons = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, baseUnitsPerMeganewton);

/** One pound of force is 0.45359237 kg times 9.80665 m/s², exactly. */
const baseUnitsPerPound = BigDecimal.make(44482216152605n, 10);

export const pounds = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPound));

export const inPounds = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, baseUnitsPerPound);

/** One kip is 1000 pounds of force. */
const baseUnitsPerKip = BigDecimal.make(44482216152605n, 7);

export const kips = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKip));

export const inKips = (f: Force) =>
  BigDecimal.unsafeDivide(f.value, baseUnitsPerKip);
