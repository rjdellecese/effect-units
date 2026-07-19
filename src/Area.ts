import * as Constants from "./internal/constants";
import * as Length from "./Length";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type SquareMeters = Unit.Squared<Length.Meters>;
export const SquareMeters: SquareMeters = Unit.squared(Length.Meters);

export type Area = Quantity.Quantity<SquareMeters>;

export const Area = Quantity.Quantity(SquareMeters);
export const AreaFromSelf = Quantity.QuantityFromSelf(SquareMeters);

const make = (value: number): Area => Quantity.make(SquareMeters, value);

export const zero = make(0);

// Metric

export const squareMeters = (n: number) => make(n);

export const inSquareMeters = (a: Area) => a.value;

const squareMetersPerSquareMillimeter = Prefix.toBase("Milli", 1) ** 2;

export const squareMillimeters = (n: number) =>
  make(n * squareMetersPerSquareMillimeter);

export const inSquareMillimeters = (a: Area) =>
  a.value / squareMetersPerSquareMillimeter;

const squareMetersPerSquareCentimeter = Prefix.toBase("Centi", 1) ** 2;

export const squareCentimeters = (n: number) =>
  make(n * squareMetersPerSquareCentimeter);

export const inSquareCentimeters = (a: Area) =>
  a.value / squareMetersPerSquareCentimeter;

/** One hectare is one square hectometer. */
const squareMetersPerHectare = Prefix.toBase("Hecto", 1) ** 2;

export const hectares = (n: number) => make(n * squareMetersPerHectare);

export const inHectares = (a: Area) => a.value / squareMetersPerHectare;

const squareMetersPerSquareKilometer = Prefix.toBase("Kilo", 1) ** 2;

export const squareKilometers = (n: number) =>
  make(n * squareMetersPerSquareKilometer);

export const inSquareKilometers = (a: Area) =>
  a.value / squareMetersPerSquareKilometer;

// Imperial

const squareMetersPerSquareInch =
  Constants.metersPerInch * Constants.metersPerInch;

export const squareInches = (n: number) =>
  make(n * squareMetersPerSquareInch);

export const inSquareInches = (a: Area) => a.value / squareMetersPerSquareInch;

const squareMetersPerSquareFoot =
  Constants.metersPerFoot * Constants.metersPerFoot;

export const squareFeet = (n: number) => make(n * squareMetersPerSquareFoot);

export const inSquareFeet = (a: Area) => a.value / squareMetersPerSquareFoot;

const squareMetersPerSquareYard =
  Constants.metersPerYard * Constants.metersPerYard;

export const squareYards = (n: number) => make(n * squareMetersPerSquareYard);

export const inSquareYards = (a: Area) => a.value / squareMetersPerSquareYard;

/** One acre is 4840 square yards. */
const squareYardsPerAcre = 4840;
const squareMetersPerAcre = squareYardsPerAcre * squareMetersPerSquareYard;

export const acres = (n: number) => make(n * squareMetersPerAcre);

export const inAcres = (a: Area) => a.value / squareMetersPerAcre;

const squareMetersPerSquareMile =
  Constants.metersPerMile * Constants.metersPerMile;

export const squareMiles = (n: number) => make(n * squareMetersPerSquareMile);

export const inSquareMiles = (a: Area) => a.value / squareMetersPerSquareMile;
