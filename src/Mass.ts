import * as BigDecimal from "effect/BigDecimal";

import * as Quantity from "./Quantity";

export type Kilograms = "Kilograms";
export const Kilograms: Kilograms = "Kilograms";

export type Mass = Quantity.Quantity<Kilograms>;

export const Mass = Quantity.Quantity(Kilograms);
export const MassFromSelf = Quantity.QuantityFromSelf(Kilograms);

const make = (value: BigDecimal.BigDecimal): Mass =>
  Quantity.make(Kilograms, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const kilograms = (n: BigDecimal.BigDecimal) => make(n);

export const inKilograms = (m: Mass) => m.value;

const kilogramsPerGram = BigDecimal.make(1n, 3);

export const grams = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerGram));

export const inGrams = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerGram);

const kilogramsPerMilligram = BigDecimal.make(1n, 6);

export const milligrams = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerMilligram));

export const inMilligrams = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerMilligram);

const kilogramsPerMicrogram = BigDecimal.make(1n, 9);

export const micrograms = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerMicrogram));

export const inMicrograms = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerMicrogram);

const kilogramsPerNanogram = BigDecimal.make(1n, 12);

export const nanograms = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerNanogram));

export const inNanograms = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerNanogram);

const kilogramsPerMetricTon = BigDecimal.fromBigInt(1000n);

export const metricTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerMetricTon));

export const inMetricTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerMetricTon);

// Imperial

const kilogramsPerOunce = BigDecimal.make(28349523125n, 12);

export const ounces = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerOunce));

export const inOunces = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerOunce);

const kilogramsPerPound = BigDecimal.make(45359237n, 8);

export const pounds = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerPound));

export const inPounds = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerPound);

/** One long ton (UK) is 2240 pounds. */
const kilogramsPerLongTon = BigDecimal.make(10160469088n, 7);

export const longTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerLongTon));

export const inLongTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerLongTon);

/** One short ton (US) is 2000 pounds. */
const kilogramsPerShortTon = BigDecimal.make(90718474n, 5);

export const shortTons = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, kilogramsPerShortTon));

export const inShortTons = (m: Mass) =>
  BigDecimal.unsafeDivide(m.value, kilogramsPerShortTon);
