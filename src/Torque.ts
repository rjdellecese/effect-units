import * as BigDecimal from "effect/BigDecimal";

import * as Force from "./Force";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

/**
 * Note that, as in `elm-units`, torque has the same units type as energy
 * (`Product<Newtons, Meters>`) — the two are dimensionally indistinguishable.
 */
export type NewtonMeters = Unit.Product<Force.Newtons, Length.Meters>;
export const NewtonMeters: NewtonMeters = Unit.product(
  Force.Newtons,
  Length.Meters,
);

export type Torque = Quantity.Quantity<NewtonMeters>;

export const Torque = Quantity.Quantity(NewtonMeters);
export const TorqueFromSelf = Quantity.QuantityFromSelf(NewtonMeters);

const make = (value: BigDecimal.BigDecimal): Torque =>
  Quantity.make(NewtonMeters, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Because the library's mass base unit is grams (not kilograms), one newton
// meter is 1000 base units (g·m²/s²).
const baseUnitsPerNewtonMeter = BigDecimal.fromBigInt(1000n);

export const newtonMeters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerNewtonMeter));

export const inNewtonMeters = (t: Torque) =>
  BigDecimal.unsafeDivide(t.value, baseUnitsPerNewtonMeter);

/** One pound foot is one pound of force times one foot, exactly. */
const baseUnitsPerPoundFoot = BigDecimal.make(13558179483314004n, 13);

export const poundFeet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerPoundFoot));

export const inPoundFeet = (t: Torque) =>
  BigDecimal.unsafeDivide(t.value, baseUnitsPerPoundFoot);
