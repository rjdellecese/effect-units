import * as BigDecimal from "effect/BigDecimal";

import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type SquareMeters = Unit.Squared<Length.Meters>;
export const SquareMeters: SquareMeters = Unit.squared(Length.Meters);

export type Area = Quantity.Quantity<SquareMeters>;

export const Area = Quantity.Quantity(SquareMeters);
export const AreaFromSelf = Quantity.QuantityFromSelf(SquareMeters);

const make = (value: BigDecimal.BigDecimal): Area =>
  Quantity.make(SquareMeters, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const squareMeters = (n: BigDecimal.BigDecimal) => make(n);

export const inSquareMeters = (a: Area) => a.value;

const squareMetersPerSquareMillimeter = BigDecimal.make(1n, 6);

export const squareMillimeters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareMillimeter));

export const inSquareMillimeters = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareMillimeter);

const squareMetersPerSquareCentimeter = BigDecimal.make(1n, 4);

export const squareCentimeters = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareCentimeter));

export const inSquareCentimeters = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareCentimeter);

const squareMetersPerHectare = BigDecimal.fromBigInt(10_000n);

export const hectares = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerHectare));

export const inHectares = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerHectare);

const squareMetersPerSquareKilometer = BigDecimal.fromBigInt(1_000_000n);

export const squareKilometers = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareKilometer));

export const inSquareKilometers = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareKilometer);

// Imperial

const squareMetersPerSquareInch = BigDecimal.make(64516n, 8);

export const squareInches = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareInch));

export const inSquareInches = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareInch);

const squareMetersPerSquareFoot = BigDecimal.make(9290304n, 8);

export const squareFeet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareFoot));

export const inSquareFeet = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareFoot);

const squareMetersPerSquareYard = BigDecimal.make(83612736n, 8);

export const squareYards = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareYard));

export const inSquareYards = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareYard);

/** One acre is 4840 square yards. */
const squareMetersPerAcre = BigDecimal.make(40468564224n, 7);

export const acres = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerAcre));

export const inAcres = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerAcre);

const squareMetersPerSquareMile = BigDecimal.make(2589988110336n, 6);

export const squareMiles = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, squareMetersPerSquareMile));

export const inSquareMiles = (a: Area) =>
  BigDecimal.unsafeDivide(a.value, squareMetersPerSquareMile);
