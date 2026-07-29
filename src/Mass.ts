import * as Constants from "./internal/constants.ts";
import * as Prefix from "./Prefix.ts";
import * as Quantity from "./Quantity.ts";

export type Kilograms = "Kilograms";
export const Kilograms: Kilograms = "Kilograms";

export type Mass = Quantity.Quantity<Kilograms>;

export const Mass = Quantity.Quantity(Kilograms);
export const MassFromStruct = Quantity.QuantityFromStruct(Kilograms);

const make = (value: number): Mass => Quantity.make(Kilograms, value);

export const zero = make(0);

// Metric

export const kilograms = (n: number) => make(n);

export const inKilograms = (m: Mass) => m.value;

const kilogramsPerGram = Prefix.toPrefixed("Kilo", 1);

export const grams = (n: number) => make(n * kilogramsPerGram);

export const inGrams = (m: Mass) => m.value / kilogramsPerGram;

const kilogramsPerMilligram = Prefix.toBase("Milli", kilogramsPerGram);

export const milligrams = (n: number) => make(n * kilogramsPerMilligram);

export const inMilligrams = (m: Mass) => m.value / kilogramsPerMilligram;

const kilogramsPerMicrogram = Prefix.toBase("Micro", kilogramsPerGram);

export const micrograms = (n: number) => make(n * kilogramsPerMicrogram);

export const inMicrograms = (m: Mass) => m.value / kilogramsPerMicrogram;

// A literal rather than a prefix chain: composing two power-of-ten factors
// rounds twice and lands one ulp off the true 10^-12.
const kilogramsPerNanogram = 1e-12;

export const nanograms = (n: number) => make(n * kilogramsPerNanogram);

export const inNanograms = (m: Mass) => m.value / kilogramsPerNanogram;

const kilogramsPerMetricTon = 1000;

export const metricTons = (n: number) => make(n * kilogramsPerMetricTon);

export const inMetricTons = (m: Mass) => m.value / kilogramsPerMetricTon;

// Imperial

const kilogramsPerPound = Constants.kilogramsPerPound;

/** One ounce is 1/16 of a pound. */
const kilogramsPerOunce = kilogramsPerPound / 16;

export const ounces = (n: number) => make(n * kilogramsPerOunce);

export const inOunces = (m: Mass) => m.value / kilogramsPerOunce;

export const pounds = (n: number) => make(n * kilogramsPerPound);

export const inPounds = (m: Mass) => m.value / kilogramsPerPound;

/**
 * One long ton (UK) is 2240 pounds: exactly 1016.0469088 kg, written as one
 * division of exact integers so the factor is correctly rounded
 * (multiplying the already-rounded pound would land one ulp off).
 */
const kilogramsPerLongTon = (45359237 * 2240) / 1e8;

export const longTons = (n: number) => make(n * kilogramsPerLongTon);

export const inLongTons = (m: Mass) => m.value / kilogramsPerLongTon;

/** One short ton (US) is 2000 pounds. */
const kilogramsPerShortTon = kilogramsPerPound * 2000;

export const shortTons = (n: number) => make(n * kilogramsPerShortTon);

export const inShortTons = (m: Mass) => m.value / kilogramsPerShortTon;
