import * as Duration from "./Duration.ts";
import * as Quantity from "./Quantity.ts";
import * as Unit from "./Unit.ts";

// Screen-space units. Note that these are unrelated to `Length.cssPixels`,
// which is a physical length (1/96 of an inch).

export type Pixels = Quantity.Quantity<"Pixels">;

export const Pixels = Quantity.Quantity("Pixels");
export const PixelsFromStruct = Quantity.QuantityFromStruct("Pixels");

export type PixelsPerSecond = Unit.Rate<"Pixels", Duration.Seconds>;
export const PixelsPerSecond: PixelsPerSecond = Unit.rate(
  "Pixels",
  Duration.Seconds,
);

export type PixelsPerSecondSquared = Unit.Rate<
  PixelsPerSecond,
  Duration.Seconds
>;
export const PixelsPerSecondSquared: PixelsPerSecondSquared = Unit.rate(
  PixelsPerSecond,
  Duration.Seconds,
);

export type SquarePixels = Unit.Squared<"Pixels">;
export const SquarePixels: SquarePixels = Unit.squared("Pixels");

export const zero = Quantity.make("Pixels", 0);

export const pixels = (n: number): Pixels => Quantity.make("Pixels", n);

export const inPixels = (p: Pixels) => p.value;

export const pixelsPerSecond = (
  n: number,
): Quantity.Quantity<PixelsPerSecond> => Quantity.make(PixelsPerSecond, n);

export const inPixelsPerSecond = (p: Quantity.Quantity<PixelsPerSecond>) =>
  p.value;

export const pixelsPerSecondSquared = (
  n: number,
): Quantity.Quantity<PixelsPerSecondSquared> =>
  Quantity.make(PixelsPerSecondSquared, n);

export const inPixelsPerSecondSquared = (
  p: Quantity.Quantity<PixelsPerSecondSquared>,
) => p.value;

export const squarePixels = (n: number): Quantity.Quantity<SquarePixels> =>
  Quantity.make(SquarePixels, n);

export const inSquarePixels = (p: Quantity.Quantity<SquarePixels>) => p.value;
