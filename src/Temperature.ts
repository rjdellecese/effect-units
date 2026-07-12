import * as BigDecimal from "effect/BigDecimal";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import * as order from "effect/Order";
import * as ParseResult from "effect/ParseResult";
import * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import * as Quantity from "./Quantity";

export const TypeId = Symbol.for("effect-units/Temperature");
export type TypeId = typeof TypeId;

/**
 * An absolute temperature (a point on the thermodynamic temperature scale,
 * stored in kelvins). Unlike a temperature `Delta`, an absolute temperature
 * is not a `Quantity` — it makes no sense to add two absolute temperatures,
 * for example.
 */
export interface Temperature extends Equal.Equal, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly value: BigDecimal.BigDecimal;
}

export const isTemperature = (u: unknown): u is Temperature =>
  Predicate.hasProperty(u, TypeId);

const Proto = {
  [TypeId]: TypeId,
  [Equal.symbol](this: Temperature, that: unknown): boolean {
    return isTemperature(that) && equals(this, that);
  },
  [Hash.symbol](this: Temperature): number {
    return Hash.hash(this.value);
  },
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
} as const;

const make = (value: BigDecimal.BigDecimal): Temperature =>
  Object.assign(Object.create(Proto), { value });

export const equals = (a: Temperature, b: Temperature): boolean =>
  Equal.equals(a.value, b.value);

export const TemperatureFromSelf = Schema.declare(isTemperature);

export const Temperature = Schema.transformOrFail(
  Schema.Struct({ value: Schema.String }),
  TemperatureFromSelf,
  {
    decode: ({ value }) =>
      Effect.gen(function* () {
        return make(yield* ParseResult.decode(Schema.BigDecimal)(value));
      }),
    encode: ({ value }) =>
      Effect.gen(function* () {
        return { value: yield* ParseResult.encode(Schema.BigDecimal)(value) };
      }),
  },
);

// Absolute temperatures

export const kelvins = (n: BigDecimal.BigDecimal): Temperature => make(n);

export const inKelvins = (t: Temperature) => t.value;

export const absoluteZero = kelvins(BigDecimal.fromBigInt(0n));

const zeroCelsiusInKelvins = BigDecimal.make(27315n, 2);

export const degreesCelsius = (n: BigDecimal.BigDecimal): Temperature =>
  make(BigDecimal.sum(n, zeroCelsiusInKelvins));

export const inDegreesCelsius = (t: Temperature) =>
  BigDecimal.subtract(t.value, zeroCelsiusInKelvins);

/**
 * The size of a Fahrenheit degree relative to a Celsius degree (5/9). The
 * ratio is non-terminating, so it is precomputed once (rounded at 100
 * significant digits) and used symmetrically, keeping roundtrips exact.
 */
const fiveNinths = BigDecimal.unsafeDivide(
  BigDecimal.fromBigInt(5n),
  BigDecimal.fromBigInt(9n),
);

const thirtyTwo = BigDecimal.fromBigInt(32n);

export const degreesFahrenheit = (n: BigDecimal.BigDecimal): Temperature =>
  degreesCelsius(BigDecimal.multiply(BigDecimal.subtract(n, thirtyTwo), fiveNinths));

export const inDegreesFahrenheit = (t: Temperature) =>
  BigDecimal.sum(
    BigDecimal.unsafeDivide(inDegreesCelsius(t), fiveNinths),
    thirtyTwo,
  );

// Deltas

/**
 * A difference between two temperatures. Unlike an absolute `Temperature`,
 * a `Delta` is an ordinary `Quantity` and participates in the usual quantity
 * arithmetic.
 */
export type Delta = Quantity.Quantity<"CelsiusDegrees">;

export const Delta = Quantity.Quantity("CelsiusDegrees");
export const DeltaFromSelf = Quantity.QuantityFromSelf("CelsiusDegrees");

export const celsiusDegrees = (n: BigDecimal.BigDecimal): Delta =>
  Quantity.make("CelsiusDegrees", n);

export const inCelsiusDegrees = (d: Delta) => d.value;

export const fahrenheitDegrees = (n: BigDecimal.BigDecimal): Delta =>
  celsiusDegrees(BigDecimal.multiply(n, fiveNinths));

export const inFahrenheitDegrees = (d: Delta) =>
  BigDecimal.unsafeDivide(d.value, fiveNinths);

// Arithmetic

export const plus: {
  (delta: Delta): (t: Temperature) => Temperature;
  (t: Temperature, delta: Delta): Temperature;
} = Function.dual(2, (t: Temperature, delta: Delta): Temperature =>
  make(BigDecimal.sum(t.value, delta.value)),
);

/** The delta from `b` up to `a` (i.e. `a` minus `b`). */
export const minus: {
  (b: Temperature): (a: Temperature) => Delta;
  (a: Temperature, b: Temperature): Delta;
} = Function.dual(2, (a: Temperature, b: Temperature): Delta =>
  celsiusDegrees(BigDecimal.subtract(a.value, b.value)),
);

// Comparison

export const Order: order.Order<Temperature> = order.mapInput(
  BigDecimal.Order,
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
