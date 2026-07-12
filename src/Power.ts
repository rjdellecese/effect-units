import * as Duration from "./Duration";
import * as Energy from "./Energy";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

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

/** One mechanical horsepower is 550 foot pounds per second. */
const wattsPerMechanicalHorsepower = 550 * 0.45359237 * 9.80665 * 0.3048;

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
