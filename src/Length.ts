import * as BigDecimal from "effect/BigDecimal";

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
