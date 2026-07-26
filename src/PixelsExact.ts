import * as Pixels from "./Pixels.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";

// Screen-space units. Note that these are unrelated to
// `LengthExact.cssPixels`, which is a physical length (1/96 of an inch).

export type PixelsExact = QuantityExact.QuantityExact<"Pixels">;

export const PixelsExact = QuantityExact.QuantityExact("Pixels");
export const PixelsExactFromSelf =
  QuantityExact.QuantityExactFromSelf("Pixels");

export const zero = QuantityExact.make("Pixels", Rational.zero);

export const pixels = (r: Rational.Rational): PixelsExact =>
  QuantityExact.make("Pixels", r);

export const inPixels = (p: PixelsExact) => p.value;

export const pixelsPerSecond = (
  r: Rational.Rational,
): QuantityExact.QuantityExact<Pixels.PixelsPerSecond> =>
  QuantityExact.make(Pixels.PixelsPerSecond, r);

export const inPixelsPerSecond = (
  p: QuantityExact.QuantityExact<Pixels.PixelsPerSecond>,
) => p.value;

export const pixelsPerSecondSquared = (
  r: Rational.Rational,
): QuantityExact.QuantityExact<Pixels.PixelsPerSecondSquared> =>
  QuantityExact.make(Pixels.PixelsPerSecondSquared, r);

export const inPixelsPerSecondSquared = (
  p: QuantityExact.QuantityExact<Pixels.PixelsPerSecondSquared>,
) => p.value;

export const squarePixels = (
  r: Rational.Rational,
): QuantityExact.QuantityExact<Pixels.SquarePixels> =>
  QuantityExact.make(Pixels.SquarePixels, r);

export const inSquarePixels = (
  p: QuantityExact.QuantityExact<Pixels.SquarePixels>,
) => p.value;
