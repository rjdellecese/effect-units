import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Mass from "./Mass.ts";
import * as Rational from "./Rational.ts";

export type ExactMass = ExactQuantity.ExactQuantity<Mass.Kilograms>;

export const ExactMass = ExactQuantity.ExactQuantity(Mass.Kilograms);
export const ExactMassFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Mass.Kilograms,
);

const make = (value: Rational.Rational): ExactMass =>
  ExactQuantity.make(Mass.Kilograms, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

// Metric

export const kilograms = (r: Rational.Rational) => make(r);

export const inKilograms = (m: ExactMass) => m.value;

const kilogramsPerGram = ExactPrefix.toPrefixed("Kilo", Rational.one);

export const grams = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerGram));

export const inGrams = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerGram);

const kilogramsPerMilligram = ExactPrefix.toBase("Milli", kilogramsPerGram);

export const milligrams = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMilligram));

export const inMilligrams = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerMilligram);

const kilogramsPerMicrogram = ExactPrefix.toBase("Micro", kilogramsPerGram);

export const micrograms = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMicrogram));

export const inMicrograms = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerMicrogram);

const kilogramsPerNanogram = ExactPrefix.toBase("Nano", kilogramsPerGram);

export const nanograms = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerNanogram));

export const inNanograms = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerNanogram);

const kilogramsPerMetricTon = Rational.make(1000n);

export const metricTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerMetricTon));

export const inMetricTons = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerMetricTon);

// Imperial

const kilogramsPerPound = ExactConstants.kilogramsPerPound;

/** One ounce is 1/16 of a pound. */
const kilogramsPerOunce = Rational.multiply(
  kilogramsPerPound,
  Rational.make(1n, 16n),
);

export const ounces = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerOunce));

export const inOunces = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerOunce);

export const pounds = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerPound));

export const inPounds = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerPound);

/** One long ton (UK) is 2240 pounds. */
const kilogramsPerLongTon = Rational.multiply(
  kilogramsPerPound,
  Rational.make(2240n),
);

export const longTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerLongTon));

export const inLongTons = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerLongTon);

/** One short ton (US) is 2000 pounds. */
const kilogramsPerShortTon = Rational.multiply(
  kilogramsPerPound,
  Rational.make(2000n),
);

export const shortTons = (r: Rational.Rational) =>
  make(Rational.multiply(r, kilogramsPerShortTon));

export const inShortTons = (m: ExactMass) =>
  Rational.unsafeDivide(m.value, kilogramsPerShortTon);
