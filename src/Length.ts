import * as BigDecimal from "effect/BigDecimal";

import { pi } from "./internal/constants";
import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Meters = "Meters";
export const Meters: Meters = "Meters";

export type Length = Quantity.Quantity<Meters>;

export const Length = Quantity.Quantity(Meters);
export const LengthFromSelf = Quantity.QuantityFromSelf(Meters);

const make = (value: BigDecimal.BigDecimal): Length =>
  Quantity.make(Meters, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const angstroms = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(1n, 10)));

export const inAngstroms = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, BigDecimal.make(1n, 10));

export const nanometers = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Nano", n));

export const inNanometers = (l: Length) =>
  Prefix.toPrefixed("Nano", l.value);

export const microns = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Micro", n));

export const inMicrons = (l: Length) => Prefix.toPrefixed("Micro", l.value);

export const kilometers = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilometers = (l: Length) => Prefix.toPrefixed("Kilo", l.value);

export const meters = (n: BigDecimal.BigDecimal) => make(n);

export const inMeters = (l: Length) => l.value;

export const centimeters = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Centi", n));

export const inCentimeters = (l: Length) =>
  Prefix.toPrefixed("Centi", l.value);

export const millimeters = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMillimeters = (l: Length) =>
  Prefix.toPrefixed("Milli", l.value);

// Imperial

/** One thou is one thousandth of an inch. */
export const thou = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(254n, 7)));

export const inThou = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, BigDecimal.make(254n, 7));

export const inches = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(254n, 4)));

export const inInches = (l: Length) =>
  l.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(5000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(127n)),
  );

export const feet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(3048n, 4)));

export const inFeet = (l: Length) =>
  l.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(1250n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(381n)),
  );

const metersPerYard = BigDecimal.make(9144n, 4);

export const yards = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerYard));

export const inYards = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerYard);

const metersPerMile = BigDecimal.make(1609344n, 3);

export const miles = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerMile));

export const inMiles = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerMile);

// Typography

const metersPerInch = BigDecimal.make(254n, 4);

/** One CSS pixel is 1/96 of an inch. */
const metersPerCssPixel = BigDecimal.unsafeDivide(
  metersPerInch,
  BigDecimal.fromBigInt(96n),
);

export const cssPixels = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerCssPixel));

export const inCssPixels = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerCssPixel);

/** One point is 1/72 of an inch. */
const metersPerPoint = BigDecimal.unsafeDivide(
  metersPerInch,
  BigDecimal.fromBigInt(72n),
);

export const points = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerPoint));

export const inPoints = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerPoint);

/** One pica is 1/6 of an inch. */
const metersPerPica = BigDecimal.unsafeDivide(
  metersPerInch,
  BigDecimal.fromBigInt(6n),
);

export const picas = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerPica));

export const inPicas = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerPica);

// Astronomical

const metersPerAstronomicalUnit = BigDecimal.fromBigInt(149597870700n);

export const astronomicalUnits = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerAstronomicalUnit));

export const inAstronomicalUnits = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerAstronomicalUnit);

/** One parsec is 648,000/π astronomical units. */
const metersPerParsec = BigDecimal.unsafeDivide(
  BigDecimal.multiply(
    metersPerAstronomicalUnit,
    BigDecimal.fromBigInt(648000n),
  ),
  pi,
);

export const parsecs = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerParsec));

export const inParsecs = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerParsec);

const metersPerLightYear = BigDecimal.fromBigInt(9460730472580800n);

export const lightYears = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, metersPerLightYear));

export const inLightYears = (l: Length) =>
  BigDecimal.unsafeDivide(l.value, metersPerLightYear);
