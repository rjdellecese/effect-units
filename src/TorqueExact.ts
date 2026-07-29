import * as ConstantsExact from "./internal/constantsExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Torque from "./Torque.ts";

export type TorqueExact = QuantityExact.QuantityExact<Torque.NewtonMeters>;

export const TorqueExact = QuantityExact.QuantityExact(Torque.NewtonMeters);
export const TorqueExactFromStruct = QuantityExact.QuantityExactFromStruct(
  Torque.NewtonMeters,
);

const make = (value: Rational.Rational): TorqueExact =>
  QuantityExact.make(Torque.NewtonMeters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const newtonMeters = (r: Rational.Rational) => make(r);

export const inNewtonMeters = (t: TorqueExact) => t.value;

/**
 * One pound foot is one pound of force times one foot—exactly
 * 3389544870828501/2500000000000000 (1.3558179483314004) newton meters.
 */
const newtonMetersPerPoundFoot = Rational.multiply(
  ConstantsExact.newtonsPerPoundForce,
  ConstantsExact.metersPerFoot,
);

export const poundFeet = (r: Rational.Rational) =>
  make(Rational.multiply(r, newtonMetersPerPoundFoot));

export const inPoundFeet = (t: TorqueExact) =>
  Rational.divideUnsafe(t.value, newtonMetersPerPoundFoot);
