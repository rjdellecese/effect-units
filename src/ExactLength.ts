import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Length from "./Length.ts";
import * as Rational from "./Rational.ts";

export type ExactLength = ExactQuantity.ExactQuantity<Length.Meters>;

export const ExactLength = ExactQuantity.ExactQuantity(Length.Meters);
export const ExactLengthFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Length.Meters,
);

const make = (value: Rational.Rational): ExactLength =>
  ExactQuantity.make(Length.Meters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

// Metric

const metersPerAngstrom = Rational.unsafeMake(1n, 10n ** 10n);

export const angstroms = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerAngstrom));

export const inAngstroms = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerAngstrom);

export const nanometers = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Nano", r));

export const inNanometers = (l: ExactLength) =>
  ExactPrefix.toPrefixed("Nano", l.value);

export const microns = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Micro", r));

export const inMicrons = (l: ExactLength) =>
  ExactPrefix.toPrefixed("Micro", l.value);

export const kilometers = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Kilo", r));

export const inKilometers = (l: ExactLength) =>
  ExactPrefix.toPrefixed("Kilo", l.value);

export const meters = (r: Rational.Rational) => make(r);

export const inMeters = (l: ExactLength) => l.value;

export const centimeters = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Centi", r));

export const inCentimeters = (l: ExactLength) =>
  ExactPrefix.toPrefixed("Centi", l.value);

export const millimeters = (r: Rational.Rational) =>
  make(ExactPrefix.toBase("Milli", r));

export const inMillimeters = (l: ExactLength) =>
  ExactPrefix.toPrefixed("Milli", l.value);

// Imperial

/** One thou is one thousandth of an inch. */
const metersPerThou = Rational.multiply(
  ExactConstants.metersPerInch,
  Rational.unsafeMake(1n, 1000n),
);

export const thou = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerThou));

export const inThou = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerThou);

export const inches = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerInch));

export const inInches = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, ExactConstants.metersPerInch);

export const feet = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerFoot));

export const inFeet = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, ExactConstants.metersPerFoot);

export const yards = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerYard));

export const inYards = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, ExactConstants.metersPerYard);

export const miles = (r: Rational.Rational) =>
  make(Rational.multiply(r, ExactConstants.metersPerMile));

export const inMiles = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, ExactConstants.metersPerMile);

// Typography

/** One CSS pixel is 1/96 of an inch. */
const metersPerCssPixel = Rational.multiply(
  ExactConstants.metersPerInch,
  Rational.unsafeMake(1n, 96n),
);

export const cssPixels = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerCssPixel));

export const inCssPixels = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerCssPixel);

/** One point is 1/72 of an inch. */
const metersPerPoint = Rational.multiply(
  ExactConstants.metersPerInch,
  Rational.unsafeMake(1n, 72n),
);

export const points = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerPoint));

export const inPoints = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerPoint);

/** One pica is 1/6 of an inch. */
const metersPerPica = Rational.multiply(
  ExactConstants.metersPerInch,
  Rational.unsafeMake(1n, 6n),
);

export const picas = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerPica));

export const inPicas = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerPica);

// Astronomical
//
// NOTE: no parsecs — one parsec is 648,000/π astronomical units, and π has
// no exact rational representation. Use Length.parsecs on the float side.

const metersPerAstronomicalUnit = Rational.unsafeMake(149597870700n);

export const astronomicalUnits = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerAstronomicalUnit));

export const inAstronomicalUnits = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerAstronomicalUnit);

const metersPerLightYear = Rational.unsafeMake(9460730472580800n);

export const lightYears = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerLightYear));

export const inLightYears = (l: ExactLength) =>
  Rational.unsafeDivide(l.value, metersPerLightYear);
