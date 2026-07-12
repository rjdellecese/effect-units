import * as BigDecimal from "effect/BigDecimal";

import * as Prefix from "./Prefix";
import * as Quantity from "./Quantity";

export type Grams = "Grams";
export const Grams: Grams = "Grams";

export type Mass = Quantity.Quantity<Grams>;

export const Mass = Quantity.Quantity(Grams);
export const MassFromSelf = Quantity.QuantityFromSelf(Grams);

const make = (value: BigDecimal.BigDecimal): Mass =>
  Quantity.make(Grams, value);

export const zero = make(BigDecimal.fromBigInt(0n));

// Metric

export const kilograms = (m: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Kilo", m));

export const inKilograms = (m: Mass) => Prefix.toPrefixed("Kilo", m.value);

export const grams = (n: BigDecimal.BigDecimal) => make(n);

export const inGrams = (m: Mass) => m.value;

export const milligrams = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Milli", n));

export const inMilligrams = (m: Mass) => Prefix.toPrefixed("Milli", m.value);

export const micrograms = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Micro", n));

export const inMicrograms = (m: Mass) => Prefix.toPrefixed("Micro", m.value);

export const nanograms = (n: BigDecimal.BigDecimal) =>
  make(Prefix.toBase("Nano", n));

export const inNanograms = (m: Mass) => Prefix.toPrefixed("Nano", m.value);

// Imperial

export const ounces = (n: BigDecimal.BigDecimal) =>
  make(
    n.pipe(
      BigDecimal.multiply(BigDecimal.fromBigInt(45359237n)),
      BigDecimal.unsafeDivide(BigDecimal.fromBigInt(1600000n)),
    ),
  );

export const inOunces = (m: Mass) =>
  m.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(1600000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(45359237n)),
  );

export const pounds = (n: BigDecimal.BigDecimal) =>
  make(
    n.pipe(
      BigDecimal.multiply(BigDecimal.fromBigInt(45359237n)),
      BigDecimal.unsafeDivide(BigDecimal.fromBigInt(100000n)),
    ),
  );

export const inPounds = (m: Mass) =>
  m.value.pipe(
    BigDecimal.multiply(BigDecimal.fromBigInt(100000n)),
    BigDecimal.unsafeDivide(BigDecimal.fromBigInt(45359237n)),
  );
