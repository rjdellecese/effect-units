import * as BigDecimal from "effect/BigDecimal";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Grams = "Grams";
export const Grams: Grams = "Grams";

export type Mass = Quantity.Quantity<Grams>;

export const Mass = Quantity.Quantity(Grams);
export const MassFromSelf = Quantity.QuantityFromSelf(Grams);

const make = (value: BigDecimal.BigDecimal): Mass =>
  Quantity.make(Grams, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const kilograms = (m: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", m));

export const inKilograms = (m: Mass) => Prefix.toPrefixed("Kilo", m.value);

export const grams = (n: BigDecimal.BigDecimal) => make(n);

export const inGrams = (m: Mass) => m.value;

export const milligrams = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMilligrams = (m: Mass) => Prefix.toPrefixed("Milli", m.value);

export const micrograms = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Micro", n));

export const inMicrograms = (m: Mass) => Prefix.toPrefixed("Micro", m.value);

export const nanograms = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Nano", n));

export const inNanograms = (m: Mass) => Prefix.toPrefixed("Nano", m.value);

const gramsPerMetricTon = BigDecimal.fromBigInt(1_000_000n);

export const metricTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, gramsPerMetricTon));

export const inMetricTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, gramsPerMetricTon);

// Imperial

export const ounces = (n: BigDecimal.BigDecimal) =>
  make(
    n.pipe(
      BigDecimal.multiply(BigDecimal.fromBigInt(45359237n)),
      BigDecimal.unsafeDivide(BigDecimal.fromBigInt(1600000n)),
    ),
  );

export const inOunces = (m: Mass) =>
  m.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(1600000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(45359237n)),
  );

export const pounds = (n: BigDecimal.BigDecimal) =>
  make(
    n.pipe(
      BigDecimal.multiply(BigDecimal.fromBigInt(45359237n)),
      BigDecimal.unsafeDivide(BigDecimal.fromBigInt(100000n)),
    ),
  );

export const inPounds = (m: Mass) =>
  m.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(100000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(45359237n)),
  );

/** One long ton (UK) is 2240 pounds. */
const gramsPerLongTon = BigDecimal.make(10160469088n, 4);

export const longTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, gramsPerLongTon));

export const inLongTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, gramsPerLongTon);

/** One short ton (US) is 2000 pounds. */
const gramsPerShortTon = BigDecimal.make(90718474n, 2);

export const shortTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, gramsPerShortTon));

export const inShortTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, gramsPerShortTon);
