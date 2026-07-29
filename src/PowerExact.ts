import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as Power from "./Power.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type PowerExact = QuantityExact.QuantityExact<Power.Watts>;

export const PowerExact = QuantityExact.QuantityExact(Power.Watts);
export const PowerExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Power.Watts,
);

const make = (value: Rational.Rational): PowerExact =>
  QuantityExact.make(Power.Watts, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via divideUnsafe.

export const watts = (r: Rational.Rational) => make(r);

export const inWatts = (p: PowerExact) => p.value;

export const kilowatts = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilowatts = (p: PowerExact) =>
  PrefixExact.toPrefixed("Kilo", p.value);

export const megawatts = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Mega", r));

export const inMegawatts = (p: PowerExact) =>
  PrefixExact.toPrefixed("Mega", p.value);

/** One metric horsepower is 735.49875 (exactly 588399/800) watts. */
const wattsPerMetricHorsepower = Rational.makeUnsafe(73549875n, 100000n);

export const metricHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerMetricHorsepower));

export const inMetricHorsepower = (p: PowerExact) =>
  Rational.divideUnsafe(p.value, wattsPerMetricHorsepower);

/**
 * One mechanical horsepower is 550 foot pounds of force per second—exactly
 * 37284993579113511/50000000000000 (745.69987158227022) watts.
 */
const footPoundsPerSecondPerMechanicalHorsepower = Rational.makeUnsafe(550n);
const wattsPerMechanicalHorsepower = Rational.multiply(
  footPoundsPerSecondPerMechanicalHorsepower,
  Rational.multiply(
    ConstantsExact.newtonsPerPoundForce,
    ConstantsExact.metersPerFoot,
  ),
);

export const mechanicalHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerMechanicalHorsepower));

export const inMechanicalHorsepower = (p: PowerExact) =>
  Rational.divideUnsafe(p.value, wattsPerMechanicalHorsepower);

/** One electrical horsepower is 746 watts. */
const wattsPerElectricalHorsepower = Rational.makeUnsafe(746n);

export const electricalHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerElectricalHorsepower));

export const inElectricalHorsepower = (p: PowerExact) =>
  Rational.divideUnsafe(p.value, wattsPerElectricalHorsepower);
