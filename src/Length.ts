import * as BigDecimal from "effect/BigDecimal";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

const make = (value: BigDecimal.BigDecimal): Quantity.Quantity.Length =>
  Quantity.make("Meters", value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const kilometers = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", n));

export const inKilometers = (l: Quantity.Quantity.Length) =>
  Prefix.toPrefixed("Kilo", l.value);

export const meters = (n: BigDecimal.BigDecimal) => make(n);

export const inMeters = (l: Quantity.Quantity.Length) => l.value;

export const centimeters = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Centi", n));

export const inCentimeters = (l: Quantity.Quantity.Length) =>
  Prefix.toPrefixed("Centi", l.value);

export const millimeters = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMillimeters = (l: Quantity.Quantity.Length) =>
  Prefix.toPrefixed("Milli", l.value);

// Imperial

export const inches = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(254n, 4)));

export const inInches = (l: Quantity.Quantity.Length) =>
  l.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(5000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(127n)),
  );

export const feet = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, BigDecimal.make(3048n, 4)));

export const inFeet = (l: Quantity.Quantity.Length) =>
  l.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(1250n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(381n)),
  );
