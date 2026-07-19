import * as Force from "./Force.js";
import * as Constants from "./internal/constants.js";
import * as Length from "./Length.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";

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
const newtonMetersPerPoundFoot =
  Constants.newtonsPerPoundForce * Constants.metersPerFoot;

export const poundFeet = (n: number) => make(n * newtonMetersPerPoundFoot);

export const inPoundFeet = (t: Torque) => t.value / newtonMetersPerPoundFoot;
