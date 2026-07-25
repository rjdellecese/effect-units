/**
 * Exact rational sources of truth for the conversion factors shared by
 * multiple exact unit modules, in SI units. All are exact defined values
 * (the 1959 international yard and pound agreement, standard gravity),
 * authored directly from their defining decimals.
 *
 * The float constants in ./constants.ts are deliberately NOT derived from
 * these (keeping bigint code out of float-only bundles); instead,
 * test/ExactConstants.test.ts asserts bit-identity between the two
 * families.
 *
 * @module
 */
import * as Rational from "../Rational.ts";

/** Meters per international inch (25.4 mm exactly). */
export const metersPerInch = Rational.unsafeMake(127n, 5000n);

/** Meters per international foot (12 inches). */
export const metersPerFoot = Rational.unsafeMake(381n, 1250n);

/** Meters per international yard (3 feet). */
export const metersPerYard = Rational.unsafeMake(1143n, 1250n);

/** Meters per international mile (1760 yards). */
export const metersPerMile = Rational.unsafeMake(201168n, 125n);

/** Kilograms per avoirdupois pound. */
export const kilogramsPerPound = Rational.unsafeMake(45359237n, 100000000n);

/** Standard gravity, in meters per second squared. */
export const gee = Rational.unsafeMake(196133n, 20000n);

/** Newtons per pound of force (one pound under standard gravity). */
export const newtonsPerPoundForce = Rational.multiply(kilogramsPerPound, gee);

export const secondsPerMinute = Rational.unsafeMake(60n);

export const secondsPerHour = Rational.unsafeMake(3600n);
