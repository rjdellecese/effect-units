import * as Area from "./Area.ts";
import * as ConstantsExact from "./internal/constantsExact.ts";
import * as PrefixExact from "./internal/prefixExact.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

export type AreaExact = QuantityExact.QuantityExact<Area.SquareMeters>;

export const AreaExact = QuantityExact.QuantityExact(Area.SquareMeters);
export const AreaExactFromSelf = QuantityExact.QuantityExactFromSelf(
  Area.SquareMeters,
);

const make = (value: Rational.Rational): AreaExact =>
  QuantityExact.make(Area.SquareMeters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

const squared = (r: Rational.Rational) => Rational.multiply(r, r);

// Metric

export const squareMeters = (r: Rational.Rational) => make(r);

export const inSquareMeters = (a: AreaExact) => a.value;

const squareMetersPerSquareMillimeter = squared(
  PrefixExact.toBase("Milli", Rational.one),
);

export const squareMillimeters = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareMillimeter));

export const inSquareMillimeters = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareMillimeter);

const squareMetersPerSquareCentimeter = squared(
  PrefixExact.toBase("Centi", Rational.one),
);

export const squareCentimeters = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareCentimeter));

export const inSquareCentimeters = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareCentimeter);

/** One hectare is one square hectometer. */
const squareMetersPerHectare = squared(
  PrefixExact.toBase("Hecto", Rational.one),
);

export const hectares = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerHectare));

export const inHectares = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerHectare);

const squareMetersPerSquareKilometer = squared(
  PrefixExact.toBase("Kilo", Rational.one),
);

export const squareKilometers = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareKilometer));

export const inSquareKilometers = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareKilometer);

// Imperial

const squareMetersPerSquareInch = squared(ConstantsExact.metersPerInch);

export const squareInches = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareInch));

export const inSquareInches = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareInch);

const squareMetersPerSquareFoot = squared(ConstantsExact.metersPerFoot);

export const squareFeet = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareFoot));

export const inSquareFeet = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareFoot);

const squareMetersPerSquareYard = squared(ConstantsExact.metersPerYard);

export const squareYards = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareYard));

export const inSquareYards = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareYard);

/** One acre is 4840 square yards. */
const squareYardsPerAcre = Rational.unsafeMake(4840n);
const squareMetersPerAcre = Rational.multiply(
  squareYardsPerAcre,
  squareMetersPerSquareYard,
);

export const acres = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerAcre));

export const inAcres = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerAcre);

const squareMetersPerSquareMile = squared(ConstantsExact.metersPerMile);

export const squareMiles = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareMile));

export const inSquareMiles = (a: AreaExact) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareMile);
