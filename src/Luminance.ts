import * as BigDecimal from "effect/BigDecimal";

import * as Area from "./Area";
import { pi } from "./internal/constants";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

export type Nits = Unit.Rate<LuminousIntensity.Candelas, Area.SquareMeters>;
export const Nits: Nits = Unit.rate(
  LuminousIntensity.Candelas,
  Area.SquareMeters,
);

export type Luminance = Quantity.Quantity<Nits>;

export const Luminance = Quantity.Quantity(Nits);
export const LuminanceFromSelf = Quantity.QuantityFromSelf(Nits);

const make = (value: BigDecimal.BigDecimal): Luminance =>
  Quantity.make(Nits, value);

export const zero = make(BigDecimal.fromBigInt(0n));

export const nits = (n: BigDecimal.BigDecimal) => make(n);

export const inNits = (l: Luminance) => l.value;

/**
 * One foot lambert is 1/π candelas per square foot. The factor is
 * precomputed once (rounded at 100 significant digits) and used
 * symmetrically, keeping roundtrips exact.
 */
const nitsPerFootLambert = BigDecimal.unsafeDivide(
  BigDecimal.fromBigInt(1n),
  BigDecimal.multiply(pi, BigDecimal.make(9290304n, 8)),
);

export const footLamberts = (n: BigDecimal.BigDecimal) =>
  make(BigDecimal.multiply(n, nitsPerFootLambert));

export const inFootLamberts = (l: Luminance) =>
  BigDecimal.unsafeDivide(l.value, nitsPerFootLambert);
