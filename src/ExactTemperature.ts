import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import * as order from "effect/Order";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import * as ExactQuantity from "./ExactQuantity.ts";
import { ValueObjectProto } from "./internal/valueObject.ts";
import * as Rational from "./Rational.ts";
import * as Temperature from "./Temperature.ts";

export const TypeId = Symbol.for("effect-units/ExactTemperature");
export type TypeId = typeof TypeId;

/**
 * An exact absolute temperature (a point on the thermodynamic temperature
 * scale, stored in kelvins as an arbitrary-precision rational). Unlike a
 * temperature `Delta`, an absolute temperature is not an `ExactQuantity` —
 * it makes no sense to add two absolute temperatures, for example.
 */
export interface ExactTemperature
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly value: Rational.Rational;
}

export const isExactTemperature = (u: unknown): u is ExactTemperature =>
  Predicate.hasProperty(u, TypeId);

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: ExactTemperature, that: unknown): boolean {
    return isExactTemperature(that) && equals(this, that);
  },
  [Hash.symbol](this: ExactTemperature): number {
    return Hash.hash(this.value);
  },
  toJSON(this: ExactTemperature) {
    return {
      _id: "ExactTemperature",
      unit: "Kelvins",
      value: Rational.format(this.value),
    };
  },
} as const;

const make = (value: Rational.Rational): ExactTemperature =>
  Object.assign(Object.create(Proto), { value });

export const equals = (a: ExactTemperature, b: ExactTemperature): boolean =>
  Rational.equals(a.value, b.value);

export const ExactTemperatureFromSelf = Schema.declare(
  isExactTemperature,
).annotations({
  identifier: "ExactTemperatureFromSelf",
  description: "an exact absolute temperature",
});

/**
 * The wire format carries a `unit: "Kelvins"` discriminator so persisted
 * temperatures are self-describing, matching the `{ unit, value }`
 * convention of `ExactQuantity` schemas, with the value in the canonical
 * rational encoding (`"3/2"`, `"-3/2"`, `"3"`) — exact on the wire, with no
 * width or precision ceiling.
 */
export const ExactTemperature = Schema.transform(
  Schema.Struct({
    unit: Schema.Literal("Kelvins"),
    value: Rational.Rational,
  }),
  ExactTemperatureFromSelf,
  {
    strict: true,
    decode: ({ value }) => make(value),
    encode: ({ value }) => ({ unit: "Kelvins" as const, value }),
  },
);

// Absolute temperatures

export const kelvins = (r: Rational.Rational): ExactTemperature => make(r);

export const inKelvins = (t: ExactTemperature) => t.value;

export const absoluteZero = kelvins(Rational.zero);

const zeroCelsiusInKelvins = Rational.make(5463n, 20n);

export const degreesCelsius = (r: Rational.Rational): ExactTemperature =>
  make(Rational.sum(r, zeroCelsiusInKelvins));

export const inDegreesCelsius = (t: ExactTemperature) =>
  Rational.subtract(t.value, zeroCelsiusInKelvins);

/** The size of a Fahrenheit degree relative to a Celsius degree. */
const fiveNinths = Rational.make(5n, 9n);

export const degreesFahrenheit = (r: Rational.Rational): ExactTemperature =>
  degreesCelsius(
    Rational.multiply(Rational.subtract(r, Rational.make(32n)), fiveNinths),
  );

export const inDegreesFahrenheit = (t: ExactTemperature) =>
  Rational.sum(
    Rational.unsafeDivide(inDegreesCelsius(t), fiveNinths),
    Rational.make(32n),
  );

// Deltas

/**
 * A difference between two temperatures. Unlike an absolute
 * `ExactTemperature`, a `Delta` is an ordinary `ExactQuantity` and
 * participates in the usual quantity arithmetic.
 *
 * Note the deliberate word order, following `elm-units` and standard
 * metrology usage: "degrees Celsius" (`degreesCelsius`) is a point on the
 * scale, while "Celsius degrees" (`celsiusDegrees`) is a number of
 * scale-sized intervals — a rise of 5 Celsius degrees, from 20 degrees
 * Celsius to 25.
 */
export type Delta = ExactQuantity.ExactQuantity<"CelsiusDegrees">;

export const Delta = ExactQuantity.ExactQuantity("CelsiusDegrees");
export const DeltaFromSelf =
  ExactQuantity.ExactQuantityFromSelf("CelsiusDegrees");

export const celsiusDegrees = (r: Rational.Rational): Delta =>
  ExactQuantity.make("CelsiusDegrees", r);

export const inCelsiusDegrees = (d: Delta) => d.value;

export const fahrenheitDegrees = (r: Rational.Rational): Delta =>
  celsiusDegrees(Rational.multiply(r, fiveNinths));

export const inFahrenheitDegrees = (d: Delta) =>
  Rational.unsafeDivide(d.value, fiveNinths);

// Arithmetic

export const plus: {
  (delta: Delta): (t: ExactTemperature) => ExactTemperature;
  (t: ExactTemperature, delta: Delta): ExactTemperature;
} = Function.dual(
  2,
  (t: ExactTemperature, delta: Delta): ExactTemperature =>
    make(Rational.sum(t.value, delta.value)),
);

/** The delta from `b` up to `a` (i.e. `a` minus `b`). */
export const minus: {
  (b: ExactTemperature): (a: ExactTemperature) => Delta;
  (a: ExactTemperature, b: ExactTemperature): Delta;
} = Function.dual(
  2,
  (a: ExactTemperature, b: ExactTemperature): Delta =>
    celsiusDegrees(Rational.subtract(a.value, b.value)),
);

// Comparison

export const Order: order.Order<ExactTemperature> = order.mapInput(
  Rational.Order,
  (t: ExactTemperature) => t.value,
);

export const lessThan = order.lessThan(Order);

export const lessThanOrEqualTo = order.lessThanOrEqualTo(Order);

export const greaterThan = order.greaterThan(Order);

export const greaterThanOrEqualTo = order.greaterThanOrEqualTo(Order);

export const min: {
  (b: ExactTemperature): (a: ExactTemperature) => ExactTemperature;
  (a: ExactTemperature, b: ExactTemperature): ExactTemperature;
} = order.min(Order);

export const max: {
  (b: ExactTemperature): (a: ExactTemperature) => ExactTemperature;
  (a: ExactTemperature, b: ExactTemperature): ExactTemperature;
} = order.max(Order);

export const clamp: {
  (options: {
    readonly minimum: ExactTemperature;
    readonly maximum: ExactTemperature;
  }): (t: ExactTemperature) => ExactTemperature;
  (
    t: ExactTemperature,
    options: {
      readonly minimum: ExactTemperature;
      readonly maximum: ExactTemperature;
    },
  ): ExactTemperature;
} = order.clamp(Order);

// Interop
//
// Crossing between the float and exact worlds is always explicit. Going
// exact is lossless (every finite double is a dyadic rational); coming back
// is one correct rounding.

/**
 * The exact image of a float temperature — lossless, since every finite
 * double is a dyadic rational. Returns `Option.none()` for NaN and
 * ±Infinity, which have no rational image.
 */
export const fromTemperature = (
  t: Temperature.Temperature,
): Option.Option<ExactTemperature> =>
  Option.map(Rational.fromNumber(t.value), make);

/** Throws a `RangeError` on NaN and ±Infinity values. */
export const unsafeFromTemperature = (
  t: Temperature.Temperature,
): ExactTemperature => make(Rational.unsafeFromNumber(t.value));

/**
 * The float temperature nearest the exact one — a single correct rounding.
 * Returns `Option.none()` when the value overflows to ±Infinity.
 */
export const toTemperature = (
  t: ExactTemperature,
): Option.Option<Temperature.Temperature> =>
  Option.map(Rational.toNumber(t.value), Temperature.kelvins);

/** Throws a `RangeError` when the value overflows to ±Infinity. */
export const unsafeToTemperature = (
  t: ExactTemperature,
): Temperature.Temperature =>
  Temperature.kelvins(Rational.unsafeToNumber(t.value));
