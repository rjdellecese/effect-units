import * as Duration from "./Duration.js";
import * as Energy from "./Energy.js";
import * as Constants from "./internal/constants.js";
import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";

export type Watts = Unit.Rate<Energy.Joules, Duration.Seconds>;
export const Watts: Watts = Unit.rate(Energy.Joules, Duration.Seconds);

export type Power = Quantity.Quantity<Watts>;

export const Power = Quantity.Quantity(Watts);
export const PowerFromSelf = Quantity.QuantityFromSelf(Watts);

const make = (value: number): Power => Quantity.make(Watts, value);

export const zero = make(0);

export const watts = (n: number) => make(n);

export const inWatts = (p: Power) => p.value;

export const kilowatts = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilowatts = (p: Power) => Prefix.toPrefixed("Kilo", p.value);

export const megawatts = (n: number) => make(Prefix.toBase("Mega", n));

export const inMegawatts = (p: Power) => Prefix.toPrefixed("Mega", p.value);

/** One metric horsepower is 735.49875 watts. */
const wattsPerMetricHorsepower = 735.49875;

export const metricHorsepower = (n: number) =>
  make(n * wattsPerMetricHorsepower);

export const inMetricHorsepower = (p: Power) =>
  p.value / wattsPerMetricHorsepower;

/** One mechanical horsepower is 550 foot pounds of force per second. */
const footPoundsPerSecondPerMechanicalHorsepower = 550;
const wattsPerMechanicalHorsepower =
  footPoundsPerSecondPerMechanicalHorsepower *
  Constants.newtonsPerPoundForce *
  Constants.metersPerFoot;

export const mechanicalHorsepower = (n: number) =>
  make(n * wattsPerMechanicalHorsepower);

export const inMechanicalHorsepower = (p: Power) =>
  p.value / wattsPerMechanicalHorsepower;

/** One electrical horsepower is 746 watts. */
const wattsPerElectricalHorsepower = 746;

export const electricalHorsepower = (n: number) =>
  make(n * wattsPerElectricalHorsepower);

export const inElectricalHorsepower = (p: Power) =>
  p.value / wattsPerElectricalHorsepower;
