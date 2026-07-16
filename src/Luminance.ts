import * as Area from "./Area";
import * as Constants from "./internal/constants";
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

const make = (value: number): Luminance => Quantity.make(Nits, value);

export const zero = make(0);

export const nits = (n: number) => make(n);

export const inNits = (l: Luminance) => l.value;

/** One foot lambert is 1/π candelas per square foot. */
const nitsPerFootLambert =
  1 / (Math.PI * Constants.metersPerFoot * Constants.metersPerFoot);

export const footLamberts = (n: number) => make(n * nitsPerFootLambert);

export const inFootLamberts = (l: Luminance) => l.value / nitsPerFootLambert;
