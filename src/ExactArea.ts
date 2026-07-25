import * as Area from "./Area.ts";
import * as ExactQuantity from "./ExactQuantity.ts";
import * as ExactConstants from "./internal/exactConstants.ts";
import * as ExactPrefix from "./internal/exactPrefix.ts";
import * as Rational from "./Rational.ts";

export type ExactArea = ExactQuantity.ExactQuantity<Area.SquareMeters>;

export const ExactArea = ExactQuantity.ExactQuantity(Area.SquareMeters);
export const ExactAreaFromSelf = ExactQuantity.ExactQuantityFromSelf(
  Area.SquareMeters,
);

const make = (value: Rational.Rational): ExactArea =>
  ExactQuantity.make(Area.SquareMeters, value);

export const zero = make(Rational.zero);

// Every extractor divides by a module factor, none of which is zero, so the
// extractors are total via unsafeDivide.

const squared = (r: Rational.Rational) => Rational.multiply(r, r);

// Metric

export const squareMeters = (r: Rational.Rational) => make(r);

export const inSquareMeters = (a: ExactArea) => a.value;

const squareMetersPerSquareMillimeter = squared(
  ExactPrefix.toBase("Milli", Rational.one),
);

export const squareMillimeters = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareMillimeter));

export const inSquareMillimeters = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareMillimeter);

const squareMetersPerSquareCentimeter = squared(
  ExactPrefix.toBase("Centi", Rational.one),
);

export const squareCentimeters = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareCentimeter));

export const inSquareCentimeters = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareCentimeter);

/** One hectare is one square hectometer. */
const squareMetersPerHectare = squared(
  ExactPrefix.toBase("Hecto", Rational.one),
);

export const hectares = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerHectare));

export const inHectares = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerHectare);

const squareMetersPerSquareKilometer = squared(
  ExactPrefix.toBase("Kilo", Rational.one),
);

export const squareKilometers = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareKilometer));

export const inSquareKilometers = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareKilometer);

// Imperial

const squareMetersPerSquareInch = squared(ExactConstants.metersPerInch);

export const squareInches = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareInch));

export const inSquareInches = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareInch);

const squareMetersPerSquareFoot = squared(ExactConstants.metersPerFoot);

export const squareFeet = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareFoot));

export const inSquareFeet = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareFoot);

const squareMetersPerSquareYard = squared(ExactConstants.metersPerYard);

export const squareYards = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareYard));

export const inSquareYards = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareYard);

/** One acre is 4840 square yards. */
const squareYardsPerAcre = Rational.unsafeMake(4840n);
const squareMetersPerAcre = Rational.multiply(
  squareYardsPerAcre,
  squareMetersPerSquareYard,
);

export const acres = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerAcre));

export const inAcres = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerAcre);

const squareMetersPerSquareMile = squared(ExactConstants.metersPerMile);

export const squareMiles = (r: Rational.Rational) =>
  make(Rational.multiply(r, squareMetersPerSquareMile));

export const inSquareMiles = (a: ExactArea) =>
  Rational.unsafeDivide(a.value, squareMetersPerSquareMile);
