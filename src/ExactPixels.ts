import * as ExactQuantity from "./ExactQuantity.ts";
import * as Pixels from "./Pixels.ts";
import * as Rational from "./Rational.ts";

// Screen-space units. Note that these are unrelated to
// `ExactLength.cssPixels`, which is a physical length (1/96 of an inch).

export type ExactPixels = ExactQuantity.ExactQuantity<"Pixels">;

export const ExactPixels = ExactQuantity.ExactQuantity("Pixels");
export const ExactPixelsFromSelf =
  ExactQuantity.ExactQuantityFromSelf("Pixels");

export const zero = ExactQuantity.make("Pixels", Rational.zero);

export const pixels = (r: Rational.Rational): ExactPixels =>
  ExactQuantity.make("Pixels", r);

export const inPixels = (p: ExactPixels) => p.value;

export const pixelsPerSecond = (
  r: Rational.Rational,
): ExactQuantity.ExactQuantity<Pixels.PixelsPerSecond> =>
  ExactQuantity.make(Pixels.PixelsPerSecond, r);

export const inPixelsPerSecond = (
  p: ExactQuantity.ExactQuantity<Pixels.PixelsPerSecond>,
) => p.value;

export const pixelsPerSecondSquared = (
  r: Rational.Rational,
): ExactQuantity.ExactQuantity<Pixels.PixelsPerSecondSquared> =>
  ExactQuantity.make(Pixels.PixelsPerSecondSquared, r);

export const inPixelsPerSecondSquared = (
  p: ExactQuantity.ExactQuantity<Pixels.PixelsPerSecondSquared>,
) => p.value;

export const squarePixels = (
  r: Rational.Rational,
): ExactQuantity.ExactQuantity<Pixels.SquarePixels> =>
  ExactQuantity.make(Pixels.SquarePixels, r);

export const inSquarePixels = (
  p: ExactQuantity.ExactQuantity<Pixels.SquarePixels>,
) => p.value;
