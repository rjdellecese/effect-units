/**
 * Conversion factors shared by multiple unit modules, in SI units. All are
 * exact defined values (the 1959 international yard and pound agreement,
 * standard gravity), written as literals so each is the correctly rounded
 * float of its defined decimal value.
 *
 * @module
 */

/** Meters per international inch. */
export const metersPerInch = 0.0254;

/** Meters per international foot (12 inches). */
export const metersPerFoot = 0.3048;

/** Meters per international yard (3 feet). */
export const metersPerYard = 0.9144;

/** Meters per international mile (1760 yards). */
export const metersPerMile = 1609.344;

/** Kilograms per avoirdupois pound. */
export const kilogramsPerPound = 0.45359237;

/** Standard gravity, in meters per second squared. */
export const gee = 9.80665;

/** Newtons per pound of force (one pound under standard gravity). */
export const newtonsPerPoundForce = kilogramsPerPound * gee;

export const secondsPerMinute = 60;

export const secondsPerHour = 3600;
