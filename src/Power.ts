import * as BigDecimal from "effect/BigDecimal";

import * as Duration from "./Duration";
import * as Energy from "./Energy";
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

// Because the library's mass base unit is grams (not kilograms), one watt is
// 1000 base units (g·m²/s³).
const baseUnitsPerWatt = BigDecimal.fromBigInt(1000n);

export const watts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerWatt));

export const inWatts = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerWatt);

const baseUnitsPerKilowatt = BigDecimal.fromBigInt(1_000_000n);

export const kilowatts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerKilowatt));

export const inKilowatts = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerKilowatt);

const baseUnitsPerMegawatt = BigDecimal.fromBigInt(1_000_000_000n);

export const megawatts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMegawatt));

export const inMegawatts = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerMegawatt);

/** One metric horsepower is 735.49875 watts, exactly. */
const baseUnitsPerMetricHorsepower = BigDecimal.make(73549875n, 2);

export const metricHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMetricHorsepower));

export const inMetricHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerMetricHorsepower);

/** One mechanical horsepower is 550 foot pounds per second, exactly. */
const baseUnitsPerMechanicalHorsepower = BigDecimal.make(74569987158227022n, 11);

export const mechanicalHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerMechanicalHorsepower));

export const inMechanicalHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerMechanicalHorsepower);

/** One electrical horsepower is 746 watts, exactly. */
const baseUnitsPerElectricalHorsepower = BigDecimal.fromBigInt(746_000n);

export const electricalHorsepower = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, baseUnitsPerElectricalHorsepower));

export const inElectricalHorsepower = (p: Power) =>
  BigDecimal.unsafeDivide(p.value, baseUnitsPerElectricalHorsepower);
