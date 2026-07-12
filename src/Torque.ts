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

export const newtonMeters = (n: BigDecimal.BigDecimal) => make(n);

export const inNewtonMeters = (t: Torque) => t.value;

/** One pound foot is one pound of force times one foot, exactly. */
const newtonMetersPerPoundFoot = BigDecimal.make(13558179483314004n, 16);

export const poundFeet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, newtonMetersPerPoundFoot));

export const inPoundFeet = (t: Torque) =>
  BigDecimal.unsafeDivide(t.value, newtonMetersPerPoundFoot);
