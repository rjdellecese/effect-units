import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as Rational from "./Rational.ts";
import * as Torque from "./Torque.ts";

export type ExactTorque = ExactQuantity.ExactQuantity<Torque.NewtonMeters>;

export const ExactTorque = ExactQuantity.ExactQuantity(Torque.NewtonMeters);
export const ExactTorqueFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Torque.NewtonMeters,
);

const make = (value: Rational.Rational): ExactTorque =>
  ExactQuantity.make(Torque.NewtonMeters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const newtonMeters = (r: Rational.Rational) => make(r);

export const inNewtonMeters = (t: ExactTorque) => t.value;

/**
 * One pound foot is one pound of force times one foot — exactly
 * 3389544870828501/2500000000000000 (1.3558179483314004) newton meters.
 */
const newtonMetersPerPoundFoot = Rational.multiply(
  ExactConstants.newtonsPerPoundForce,
  ExactConstants.metersPerFoot,
);

export const poundFeet = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonMetersPerPoundFoot));

export const inPoundFeet = (t: ExactTorque) =>
  Rational.unsafeDivide(t.value, newtonMetersPerPoundFoot);
