import * as Constants from "./internal/constants.js";
import * as Prefix from "./Prefix.js";
import * as Quantity from "./Quantity.js";

export type Meters = "Meters";
export const Meters: Meters = "Meters";

export type Length = Quantity.Quantity<Meters>;

export const Length = Quantity.Quantity(Meters);
export const LengthFromSelf = Quantity.QuantityFromSelf(Meters);

const make = (value: number): Length => Quantity.make(Meters, value);

export const zero = make(0);

// Metric

const metersPerAngstrom = 1e-10;

export const angstroms = (n: number) => make(n * metersPerAngstrom);

export const inAngstroms = (l: Length) => l.value / metersPerAngstrom;

export const nanometers = (n: number) => make(Prefix.toBase("Nano", n));

export const inNanometers = (l: Length) => Prefix.toPrefixed("Nano", l.value);

export const microns = (n: number) => make(Prefix.toBase("Micro", n));

export const inMicrons = (l: Length) => Prefix.toPrefixed("Micro", l.value);

export const kilometers = (n: number) => make(Prefix.toBase("Kilo", n));

export const inKilometers = (l: Length) => Prefix.toPrefixed("Kilo", l.value);

export const meters = (n: number) => make(n);

export const inMeters = (l: Length) => l.value;

export const centimeters = (n: number) => make(Prefix.toBase("Centi", n));

export const inCentimeters = (l: Length) => Prefix.toPrefixed("Centi", l.value);

export const millimeters = (n: number) => make(Prefix.toBase("Milli", n));

export const inMillimeters = (l: Length) => Prefix.toPrefixed("Milli", l.value);

// Imperial

/** One thou is one thousandth of an inch. */
const metersPerThou = Constants.metersPerInch / 1000;

export const thou = (n: number) => make(n * metersPerThou);

export const inThou = (l: Length) => l.value / metersPerThou;

export const inches = (n: number) => make(n * Constants.metersPerInch);

export const inInches = (l: Length) => l.value / Constants.metersPerInch;

export const feet = (n: number) => make(n * Constants.metersPerFoot);

export const inFeet = (l: Length) => l.value / Constants.metersPerFoot;

export const yards = (n: number) => make(n * Constants.metersPerYard);

export const inYards = (l: Length) => l.value / Constants.metersPerYard;

export const miles = (n: number) => make(n * Constants.metersPerMile);

export const inMiles = (l: Length) => l.value / Constants.metersPerMile;

// Typography

/** One CSS pixel is 1/96 of an inch. */
const metersPerCssPixel = Constants.metersPerInch / 96;

export const cssPixels = (n: number) => make(n * metersPerCssPixel);

export const inCssPixels = (l: Length) => l.value / metersPerCssPixel;

/** One point is 1/72 of an inch. */
const metersPerPoint = Constants.metersPerInch / 72;

export const points = (n: number) => make(n * metersPerPoint);

export const inPoints = (l: Length) => l.value / metersPerPoint;

/** One pica is 1/6 of an inch. */
const metersPerPica = Constants.metersPerInch / 6;

export const picas = (n: number) => make(n * metersPerPica);

export const inPicas = (l: Length) => l.value / metersPerPica;

// Astronomical

const metersPerAstronomicalUnit = 149597870700;

export const astronomicalUnits = (n: number) =>
  make(n * metersPerAstronomicalUnit);

export const inAstronomicalUnits = (l: Length) =>
  l.value / metersPerAstronomicalUnit;

/** One parsec is 648,000/π astronomical units. */
const metersPerParsec = (metersPerAstronomicalUnit * 648000) / Math.PI;

export const parsecs = (n: number) => make(n * metersPerParsec);

export const inParsecs = (l: Length) => l.value / metersPerParsec;

const metersPerLightYear = 9460730472580800;

export const lightYears = (n: number) => make(n * metersPerLightYear);

export const inLightYears = (l: Length) => l.value / metersPerLightYear;
