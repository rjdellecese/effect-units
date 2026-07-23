import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Power from "./Power.ts";
import * as Rational from "./Rational.ts";

export type ExactPower = ExactQuantity.ExactQuantity<Power.Watts>;

export const ExactPower = ExactQuantity.ExactQuantity(Power.Watts);
export const ExactPowerFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Power.Watts,
);

const make = (value: Rational.Rational): ExactPower =>
  ExactQuantity.make(Power.Watts, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

export const watts = (r: Rational.Rational) => make(r);

export const inWatts = (p: ExactPower) => p.value;

export const kilowatts = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilowatts = (p: ExactPower) =>
  ExactPrefix.toPrefixed("Kilo", p.value);

export const megawatts = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Mega", r));

export const inMegawatts = (p: ExactPower) =>
  ExactPrefix.toPrefixed("Mega", p.value);

/** One metric horsepower is 735.49875 (exactly 588399/800) watts. */
const wattsPerMetricHorsepower = Rational.make(73549875n, 100000n);

export const metricHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerMetricHorsepower));

export const inMetricHorsepower = (p: ExactPower) =>
  Rational.unsafeDivide(p.value, wattsPerMetricHorsepower);

/**
 * One mechanical horsepower is 550 foot pounds of force per second — exactly
 * 37284993579113511/50000000000000 (745.69987158227022) watts.
 */
const footPoundsPerSecondPerMechanicalHorsepower = Rational.make(550n);
const wattsPerMechanicalHorsepower = Rational.multiply(
  footPoundsPerSecondPerMechanicalHorsepower,
  Rational.multiply(
    ExactConstants.newtonsPerPoundForce,
    ExactConstants.metersPerFoot,
  ),
);

export const mechanicalHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerMechanicalHorsepower));

export const inMechanicalHorsepower = (p: ExactPower) =>
  Rational.unsafeDivide(p.value, wattsPerMechanicalHorsepower);

/** One electrical horsepower is 746 watts. */
const wattsPerElectricalHorsepower = Rational.make(746n);

export const electricalHorsepower = (r: Rational.Rational) =>
  make(Rational.multiply(r, wattsPerElectricalHorsepower));

export const inElectricalHorsepower = (p: ExactPower) =>
  Rational.unsafeDivide(p.value, wattsPerElectricalHorsepower);
