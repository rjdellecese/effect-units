import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Number_ from "effect/Number";
import * as order from "effect/Order";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import {
  normalizeZero,
  ValueObjectProto,
  valueEquals,
} from "./internal/valueObject.ts";
import * as Quantity from "./Quantity.ts";

export const TypeId = Symbol.for("effect-units/Temperature");
export type TypeId = typeof TypeId;

/**
 * An absolute temperature (a point on the thermodynamic temperature scale,
 * stored in kelvins). Unlike a temperature `Delta`, an absolute temperature
 * is not a `Quantity` — it makes no sense to add two absolute temperatures,
 * for example.
 */
export interface Temperature
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly value: number;
}

export const isTemperature = (u: unknown): u is Temperature =>
  Predicate.hasProperty(u, TypeId);

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: Temperature, that: unknown): boolean {
    return isTemperature(that) && equals(this, that);
  },
  [Hash.symbol](this: Temperature): number {
    return Hash.number(this.value);
  },
  toJSON(this: Temperature) {
    return { _id: "Temperature", value: this.value };
  },
} as const;

const make = (value: number): Temperature =>
  Object.assign(Object.create(Proto), { value: normalizeZero(value) });

export const equals = (a: Temperature, b: Temperature): boolean =>
  valueEquals(a.value, b.value);

export const TemperatureFromSelf = Schema.declare(isTemperature).annotations({
  identifier: "TemperatureFromSelf",
  description: "an absolute temperature",
});

/**
 * The wire format carries a `unit: "Kelvins"` discriminator so persisted
 * temperatures are self-describing, matching the `{ unit, value }`
 * convention of `Quantity` schemas. As with quantities, only finite values
 * are admitted.
 */
export const Temperature = Schema.transform(
  Schema.Struct({
    unit: Schema.Literal("Kelvins"),
    value: Schema.Number.pipe(Schema.finite()),
  }),
  TemperatureFromSelf,
  {
    strict: true,
    decode: ({ value }) => make(value),
    encode: ({ value }) => ({ unit: "Kelvins" as const, value }),
  },
);

// Absolute temperatures

export const kelvins = (n: number): Temperature => make(n);

export const inKelvins = (t: Temperature) => t.value;

export const absoluteZero = kelvins(0);

const zeroCelsiusInKelvins = 273.15;

export const degreesCelsius = (n: number): Temperature =>
  make(n + zeroCelsiusInKelvins);

export const inDegreesCelsius = (t: Temperature) =>
  t.value - zeroCelsiusInKelvins;

/** The size of a Fahrenheit degree relative to a Celsius degree. */
const fiveNinths = 5 / 9;

export const degreesFahrenheit = (n: number): Temperature =>
  degreesCelsius((n - 32) * fiveNinths);

export const inDegreesFahrenheit = (t: Temperature) =>
  inDegreesCelsius(t) / fiveNinths + 32;

// Deltas

/**
 * A difference between two temperatures. Unlike an absolute `Temperature`,
 * a `Delta` is an ordinary `Quantity` and participates in the usual quantity
 * arithmetic.
 *
 * Note the deliberate word order, following `elm-units` and standard
 * metrology usage: "degrees Celsius" (`degreesCelsius`) is a point on the
 * scale, while "Celsius degrees" (`celsiusDegrees`) is a number of
 * scale-sized intervals — a rise of 5 Celsius degrees, from 20 degrees
 * Celsius to 25.
 */
export type Delta = Quantity.Quantity<"CelsiusDegrees">;

export const Delta = Quantity.Quantity("CelsiusDegrees");
export const DeltaFromSelf = Quantity.QuantityFromSelf("CelsiusDegrees");

export const celsiusDegrees = (n: number): Delta =>
  Quantity.make("CelsiusDegrees", n);

export const inCelsiusDegrees = (d: Delta) => d.value;

export const fahrenheitDegrees = (n: number): Delta =>
  celsiusDegrees(n * fiveNinths);

export const inFahrenheitDegrees = (d: Delta) => d.value / fiveNinths;

// Arithmetic

export const plus: {
  (delta: Delta): (t: Temperature) => Temperature;
  (t: Temperature, delta: Delta): Temperature;
} = Function.dual(
  2,
  (t: Temperature, delta: Delta): Temperature => make(t.value + delta.value),
);

/** The delta from `b` up to `a` (i.e. `a` minus `b`). */
export const minus: {
  (b: Temperature): (a: Temperature) => Delta;
  (a: Temperature, b: Temperature): Delta;
} = Function.dual(
  2,
  (a: Temperature, b: Temperature): Delta => celsiusDegrees(a.value - b.value),
);

// Comparison

export const Order: order.Order<Temperature> = order.mapInput(
  Number_.Order,
  (t: Temperature) => t.value,
);

export const lessThan = order.lessThan(Order);

export const lessThanOrEqualTo = order.lessThanOrEqualTo(Order);

export const greaterThan = order.greaterThan(Order);

export const greaterThanOrEqualTo = order.greaterThanOrEqualTo(Order);

export const min: {
  (b: Temperature): (a: Temperature) => Temperature;
  (a: Temperature, b: Temperature): Temperature;
} = order.min(Order);

export const max: {
  (b: Temperature): (a: Temperature) => Temperature;
  (a: Temperature, b: Temperature): Temperature;
} = order.max(Order);

export const clamp: {
  (options: {
    readonly minimum: Temperature;
    readonly maximum: Temperature;
  }): (t: Temperature) => Temperature;
  (
    t: Temperature,
    options: { readonly minimum: Temperature; readonly maximum: Temperature },
  ): Temperature;
} = order.clamp(Order);
