import * as Force from "./Force";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type NewtonMeters = Unit.Product<Force.Newtons, Length.Meters>;
export const NewtonMeters: NewtonMeters = Unit.product(
  Force.Newtons,
  Length.Meters,
);

export type Torque = Quantity.Quantity<NewtonMeters>;

export const Torque = Quantity.Quantity(NewtonMeters);
export const TorqueFromSelf = Quantity.QuantityFromSelf(NewtonMeters);

const make = (value: number): Torque => Quantity.make(NewtonMeters, value);

export const zero = make(0);

export const newtonMeters = (n: number) => make(n);

export const inNewtonMeters = (t: Torque) => t.value;

/** One pound foot is one pound of force times one foot. */
const newtonMetersPerPoundFoot = 0.45359237 * 9.80665 * 0.3048;

export const poundFeet = (n: number) => make(n * newtonMetersPerPoundFoot);

export const inPoundFeet = (t: Torque) => t.value / newtonMetersPerPoundFoot;
