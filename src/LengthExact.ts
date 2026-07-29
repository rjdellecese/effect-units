import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as Length from "./Length.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type LengthExact = QuantityExact.QuantityExact<Length.Meters>;

export const LengthExact = QuantityExact.QuantityExact(Length.Meters);
export const LengthExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Length.Meters,
);

const make = (value: Rational.Rational): LengthExact =>
  QuantityExact.make(Length.Meters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

// Metric

const metersPerAngstrom = Rational.unsafeMake(1n, 10n ** 10n);

export const angstroms = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerAngstrom));

export const inAngstroms = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerAngstrom);

export const nanometers = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Nano", r));

export const inNanometers = (l: LengthExact) =>
  PrefixExact.toPrefixed("Nano", l.value);

export const microns = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Micro", r));

export const inMicrons = (l: LengthExact) =>
  PrefixExact.toPrefixed("Micro", l.value);

export const kilometers = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Kilo", r));

export const inKilometers = (l: LengthExact) =>
  PrefixExact.toPrefixed("Kilo", l.value);

export const meters = (r: Rational.Rational) => make(r);

export const inMeters = (l: LengthExact) => l.value;

export const centimeters = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Centi", r));

export const inCentimeters = (l: LengthExact) =>
  PrefixExact.toPrefixed("Centi", l.value);

export const millimeters = (r: Rational.Rational) =>
  make(PrefixExact.toBase("Milli", r));

export const inMillimeters = (l: LengthExact) =>
  PrefixExact.toPrefixed("Milli", l.value);

// Imperial

/** One thou is one thousandth of an inch. */
const metersPerThou = Rational.multiply(
  ConstantsExact.metersPerInch,
  Rational.unsafeMake(1n, 1000n),
);

export const thou = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerThou));

export const inThou = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerThou);

export const inches = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerInch));

export const inInches = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, ConstantsExact.metersPerInch);

export const feet = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerFoot));

export const inFeet = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, ConstantsExact.metersPerFoot);

export const yards = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerYard));

export const inYards = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, ConstantsExact.metersPerYard);

export const miles = (r: Rational.Rational) =>
  make(Rational.multiply(r, ConstantsExact.metersPerMile));

export const inMiles = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, ConstantsExact.metersPerMile);

// Typography

/** One CSS pixel is 1/96 of an inch. */
const metersPerCssPixel = Rational.multiply(
  ConstantsExact.metersPerInch,
  Rational.unsafeMake(1n, 96n),
);

export const cssPixels = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerCssPixel));

export const inCssPixels = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerCssPixel);

/** One point is 1/72 of an inch. */
const metersPerPoint = Rational.multiply(
  ConstantsExact.metersPerInch,
  Rational.unsafeMake(1n, 72n),
);

export const points = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerPoint));

export const inPoints = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerPoint);

/** One pica is 1/6 of an inch. */
const metersPerPica = Rational.multiply(
  ConstantsExact.metersPerInch,
  Rational.unsafeMake(1n, 6n),
);

export const picas = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerPica));

export const inPicas = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerPica);

// Astronomical
//
// NOTE: no parsecs—one parsec is 648,000/π astronomical units, and π has
// no exact rational representation. Use Length.parsecs on the float side.

const metersPerAstronomicalUnit = Rational.unsafeMake(149597870700n);

export const astronomicalUnits = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerAstronomicalUnit));

export const inAstronomicalUnits = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerAstronomicalUnit);

const metersPerLightYear = Rational.unsafeMake(9460730472580800n);

export const lightYears = (r: Rational.Rational) =>
  make(Rational.multiply(r, metersPerLightYear));

export const inLightYears = (l: LengthExact) =>
  Rational.unsafeDivide(l.value, metersPerLightYear);
