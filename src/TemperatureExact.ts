import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import * as order from "effect/Order";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import { ValueObjectProto } from "./internal/valueObject.ts";
import * as QuantityExact from "./QuantityExact.ts";
import * as Rational from "./Rational.ts";
import * as Temperature from "./Temperature.ts";

export const TypeId = Symbol.for("effect-units/TemperatureExact");
export type TypeId = typeof TypeId;

/**
 * An exact absolute temperature (a point on the thermodynamic temperature
 * scale, stored in kelvins as an arbitrary-precision rational). Unlike a
 * temperature `Delta`, an absolute temperature is not an `QuantityExact` —
 * it makes no sense to add two absolute temperatures, for example.
 */
export interface TemperatureExact
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly value: Rational.Rational;
}

export const isTemperatureExact = (u: unknown): u is TemperatureExact =>
  Predicate.hasProperty(u, TypeId);

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: TemperatureExact, that: unknown): boolean {
    return isTemperatureExact(that) && equals(this, that);
  },
  [Hash.symbol](this: TemperatureExact): number {
    return Hash.hash(this.value);
  },
  toJSON(this: TemperatureExact) {
    return {
      _id: "TemperatureExact",
      unit: "Kelvins",
      value: Rational.format(this.value),
    };
  },
} as const;

const make = (value: Rational.Rational): TemperatureExact =>
  Object.assign(Object.create(Proto), { value });

export const equals = (a: TemperatureExact, b: TemperatureExact): boolean =>
  Rational.equals(a.value, b.value);

export const TemperatureExactFromSelf = Schema.declare(
  isTemperatureExact,
).annotations({
  identifier: "TemperatureExactFromSelf",
  description: "an exact absolute temperature",
});

/**
 * The wire format carries a `unit: "Kelvins"` discriminator so persisted
 * temperatures are self-describing, matching the `{ unit, value }`
 * convention of `QuantityExact` schemas, with the value in the canonical
 * rational encoding (`"3/2"`, `"-3/2"`, `"3"`) — exact on the wire, with no
 * width or precision ceiling.
 */
export const TemperatureExact = Schema.transform(
  Schema.Struct({
    unit: Schema.Literal("Kelvins"),
    value: Rational.Rational,
  }),
  TemperatureExactFromSelf,
  {
    strict: true,
    decode: ({ value }) => make(value),
    encode: ({ value }) => ({ unit: "Kelvins" as const, value }),
  },
);

// Absolute temperatures

export const kelvins = (r: Rational.Rational): TemperatureExact => make(r);

export const inKelvins = (t: TemperatureExact) => t.value;

export const absoluteZero = kelvins(Rational.zero);

const zeroCelsiusInKelvins = Rational.unsafeMake(5463n, 20n);

export const degreesCelsius = (r: Rational.Rational): TemperatureExact =>
  make(Rational.sum(r, zeroCelsiusInKelvins));

export const inDegreesCelsius = (t: TemperatureExact) =>
  Rational.subtract(t.value, zeroCelsiusInKelvins);

/** The size of a Fahrenheit degree relative to a Celsius degree. */
const fiveNinths = Rational.unsafeMake(5n, 9n);

export const degreesFahrenheit = (r: Rational.Rational): TemperatureExact =>
  degreesCelsius(
    Rational.multiply(
      Rational.subtract(r, Rational.unsafeMake(32n)),
      fiveNinths,
    ),
  );

export const inDegreesFahrenheit = (t: TemperatureExact) =>
  Rational.sum(
    Rational.unsafeDivide(inDegreesCelsius(t), fiveNinths),
    Rational.unsafeMake(32n),
  );

// Deltas

/**
 * A difference between two temperatures. Unlike an absolute
 * `TemperatureExact`, a `Delta` is an ordinary `QuantityExact` and
 * participates in the usual quantity arithmetic.
 *
 * Note the deliberate word order, following `elm-units` and standard
 * metrology usage: "degrees Celsius" (`degreesCelsius`) is a point on the
 * scale, while "Celsius degrees" (`celsiusDegrees`) is a number of
 * scale-sized intervals — a rise of 5 Celsius degrees, from 20 degrees
 * Celsius to 25.
 */
export type Delta = QuantityExact.QuantityExact<"CelsiusDegrees">;

export const Delta = QuantityExact.QuantityExact("CelsiusDegrees");
export const DeltaFromSelf =
  QuantityExact.QuantityExactFromSelf("CelsiusDegrees");

export const celsiusDegrees = (r: Rational.Rational): Delta =>
  QuantityExact.make("CelsiusDegrees", r);

export const inCelsiusDegrees = (d: Delta) => d.value;

export const fahrenheitDegrees = (r: Rational.Rational): Delta =>
  celsiusDegrees(Rational.multiply(r, fiveNinths));

export const inFahrenheitDegrees = (d: Delta) =>
  Rational.unsafeDivide(d.value, fiveNinths);

// Arithmetic

export const plus: {
  (delta: Delta): (t: TemperatureExact) => TemperatureExact;
  (t: TemperatureExact, delta: Delta): TemperatureExact;
} = Function.dual(
  2,
  (t: TemperatureExact, delta: Delta): TemperatureExact =>
    make(Rational.sum(t.value, delta.value)),
);

/** The delta from `b` up to `a` (i.e. `a` minus `b`). */
export const minus: {
  (b: TemperatureExact): (a: TemperatureExact) => Delta;
  (a: TemperatureExact, b: TemperatureExact): Delta;
} = Function.dual(
  2,
  (a: TemperatureExact, b: TemperatureExact): Delta =>
    celsiusDegrees(Rational.subtract(a.value, b.value)),
);

// Comparison

export const Order: order.Order<TemperatureExact> = order.mapInput(
  Rational.Order,
  (t: TemperatureExact) => t.value,
);

export const lessThan = order.lessThan(Order);

export const lessThanOrEqualTo = order.lessThanOrEqualTo(Order);

export const greaterThan = order.greaterThan(Order);

export const greaterThanOrEqualTo = order.greaterThanOrEqualTo(Order);

export const min: {
  (b: TemperatureExact): (a: TemperatureExact) => TemperatureExact;
  (a: TemperatureExact, b: TemperatureExact): TemperatureExact;
} = order.min(Order);

export const max: {
  (b: TemperatureExact): (a: TemperatureExact) => TemperatureExact;
  (a: TemperatureExact, b: TemperatureExact): TemperatureExact;
} = order.max(Order);

export const clamp: {
  (options: {
    readonly minimum: TemperatureExact;
    readonly maximum: TemperatureExact;
  }): (t: TemperatureExact) => TemperatureExact;
  (
    t: TemperatureExact,
    options: {
      readonly minimum: TemperatureExact;
      readonly maximum: TemperatureExact;
    },
  ): TemperatureExact;
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
): Option.Option<TemperatureExact> =>
  Option.map(Rational.fromNumber(t.value), make);

/** Throws a `RangeError` on NaN and ±Infinity values. */
export const unsafeFromTemperature = (
  t: Temperature.Temperature,
): TemperatureExact => make(Rational.unsafeFromNumber(t.value));

/**
 * The float temperature nearest the exact one — a single correct rounding.
 * Returns `Option.none()` when the value overflows to ±Infinity.
 */
export const toTemperature = (
  t: TemperatureExact,
): Option.Option<Temperature.Temperature> =>
  Option.map(Rational.toNumber(t.value), Temperature.kelvins);

/** Throws a `RangeError` when the value overflows to ±Infinity. */
export const unsafeToTemperature = (
  t: TemperatureExact,
): Temperature.Temperature =>
  Temperature.kelvins(Rational.unsafeToNumber(t.value));
