import * as BigDecimal from "effect/BigDecimal";

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

const make = (value: BigDecimal.BigDecimal): Power =>
  Quantity.make(Watts, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const watts = (n: BigDecimal.BigDecimal) => make(n);

export const inWatts = (p: Power) => p.value;

export const kilowatts = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilowatts = (p: Power) => Prefix.toPrefixed("Kilo", p.value);

export const megawatts = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Mega", n));

export const inMegawatts = (p: Power) => Prefix.toPrefixed("Mega", p.value);

/** One metric horsepower is 735.49875 watts, exactly. */
const wattsPerMetricHorsepower = BigDecimal.make(73549875n, 5);

export const metricHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, wattsPerMetricHorsepower));

export const inMetricHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, wattsPerMetricHorsepower);

/** One mechanical horsepower is 550 foot pounds per second, exactly. */
const wattsPerMechanicalHorsepower = BigDecimal.make(74569987158227022n, 14);

export const mechanicalHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, wattsPerMechanicalHorsepower));

export const inMechanicalHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, wattsPerMechanicalHorsepower);

/** One electrical horsepower is 746 watts, exactly. */
const wattsPerElectricalHorsepower = BigDecimal.fromBigInt(746n);

export const electricalHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, wattsPerElectricalHorsepower));

export const inElectricalHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, wattsPerElectricalHorsepower);
