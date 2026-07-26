import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as Mass from "./Mass.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type MassExact = QuantityExact.QuantityExact<Mass.Kilograms>;

export const MassExact = QuantityExact.QuantityExact(Mass.Kilograms);
export const MassExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Mass.Kilograms,
);

const make = (value: Rational.Rational): MassExact =>
  QuantityExact.make(Mass.Kilograms, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

// Metric

export const kilograms = (r: Rational.Rational) => make(r);

export const inKilograms = (m: MassExact) => m.value;

const kilogramsPerGram = PrefixExact.toPrefixed("Kilo", Rational.one);

export const grams = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerGram));

export const inGrams = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerGram);

const kilogramsPerMilligram = PrefixExact.toBase("Milli", kilogramsPerGram);

export const milligrams = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMilligram));

export const inMilligrams = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerMilligram);

const kilogramsPerMicrogram = PrefixExact.toBase("Micro", kilogramsPerGram);

export const micrograms = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMicrogram));

export const inMicrograms = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerMicrogram);

const kilogramsPerNanogram = PrefixExact.toBase("Nano", kilogramsPerGram);

export const nanograms = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerNanogram));

export const inNanograms = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerNanogram);

const kilogramsPerMetricTon = Rational.unsafeMake(1000n);

export const metricTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMetricTon));

export const inMetricTons = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerMetricTon);

// Imperial

const kilogramsPerPound = ConstantsExact.kilogramsPerPound;

/** One ounce is 1/16 of a pound. */
const kilogramsPerOunce = Rational.multiply(
  kilogramsPerPound,
  Rational.unsafeMake(1n, 16n),
);

export const ounces = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerOunce));

export const inOunces = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerOunce);

export const pounds = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerPound));

export const inPounds = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerPound);

/** One long ton (UK) is 2240 pounds. */
const kilogramsPerLongTon = Rational.multiply(
  kilogramsPerPound,
  Rational.unsafeMake(2240n),
);

export const longTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerLongTon));

export const inLongTons = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerLongTon);

/** One short ton (US) is 2000 pounds. */
const kilogramsPerShortTon = Rational.multiply(
  kilogramsPerPound,
  Rational.unsafeMake(2000n),
);

export const shortTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerShortTon));

export const inShortTons = (m: MassExact) =>
  Rational.unsafeDivide(m.value, kilogramsPerShortTon);
