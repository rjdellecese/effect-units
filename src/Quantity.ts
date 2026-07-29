import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import {
  normalizeZero,
  ValueObjectProto,
  valueEquals,
} from "./internal/valueObject.ts";
import * as Unit from "./Unit.ts";

export const TypeId = Symbol.for("effect-units/Quantity");
export type TypeId = typeof TypeId;

/**
 * The single definition of the `{ unit, value }` wire format, shared by
 * {@link QuantityFromStruct} and by the `toCodecJson` annotation on
 * {@link Quantity}, so the two can never drift apart.
 *
 * Note that the wire format only admits finite values: NaN and ±Infinity
 * (which in-memory arithmetic produces under IEEE semantics) fail loudly at
 * encode rather than corrupting silently through JSON (where they would
 * become `null`).
 */
const wire = <const U extends Unit.Unit>(unit: U) => {
  const struct = Schema.Struct({
    unit: Schema.Literal(Unit.encode(unit)),
    value: Schema.Finite,
  });
  return {
    struct,
    transformation: SchemaTransformation.transform({
      decode: ({ value }: typeof struct.Type) => make(unit, value),
      encode: ({ value }: Quantity<U>) => ({ unit: Unit.encode(unit), value }),
    }),
  };
};

/**
 * The identity schema: a `Quantity` on both sides, decoded from itself.
 *
 * It carries the wire format as its canonical JSON representation, so
 * `Schema.toCodecJson` derives that codec on demand—including when a
 * quantity is nested inside a larger schema of your own.
 * {@link QuantityFromStruct} is the same codec named directly, with a
 * precise `{ unit, value }` encoded type rather than `Json`.
 */
export const Quantity = <const U extends Unit.Unit>(unit: U) =>
  Schema.declare(hasUnit(unit), {
    toCodecJson: () => {
      const { struct, transformation } = wire(unit);
      return Schema.link<Quantity<U>>()(struct, transformation);
    },
  });

export const QuantityFromStruct = <const U extends Unit.Unit>(unit: U) => {
  const { struct, transformation } = wire(unit);
  return struct.pipe(Schema.decodeTo(Quantity(unit), transformation));
};

/**
 * A quantity is a plain 64-bit float tagged with a unit tree. Arithmetic
 * follows IEEE 754 semantics: division by zero yields ±Infinity, and invalid
 * operations yield NaN—check with {@link isNaN} and {@link isInfinite}.
 */
export interface Quantity<U extends Unit.Unit>
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly unit: U;
  readonly value: number;
}

const isQuantity = (u: unknown): u is Quantity<Unit.Unit> =>
  Predicate.hasProperty(u, TypeId);

const hasUnit =
  <U extends Unit.Unit>(unit: U) =>
  (u: unknown): u is Quantity<U> =>
    isQuantity(u) && Unit.equals(u.unit, unit);

/**
 * `Unitless` is the identity of the unit algebra, so `times`, `over`,
 * `over_`, `squared`, and `cubed` fold a dimensionless operand away rather
 * than composing with it: the algebra never produces a `Product` with a
 * `Unitless` factor. Each of those carries an overload for the dimensionless
 * case ahead of its general one, so the static type follows the runtime.
 *
 * The exception is a quantity whose static unit has already widened to
 * `Unit.Unit`: the compiler can no longer tell whether it is dimensionless
 * and offers the general (`Product`) overload, while the runtime still
 * applies the identity. Keep units precise and the two agree.
 *
 * A `Unit.custom("Unitless")` is a different unit entirely—a custom leaf,
 * encoded `"[Unitless]"`—and is not folded away.
 */
const isUnitless = (unit: Unit.Unit): unit is "Unitless" => unit === "Unitless";

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: Quantity<Unit.Unit>, that: unknown): boolean {
    return isQuantity(that) && equals(this, that);
  },
  [Hash.symbol](this: Quantity<Unit.Unit>): number {
    return Hash.combine(Hash.string(Unit.encode(this.unit)))(
      Hash.number(this.value),
    );
  },
  toJSON(this: Quantity<Unit.Unit>) {
    return {
      _id: "Quantity",
      unit: Unit.encode(this.unit),
      value: this.value,
    };
  },
} as const;

export const make = <U extends Unit.Unit>(
  unit: U,
  value: number,
): Quantity<U> =>
  Object.assign(Object.create(Proto), {
    unit,
    value: normalizeZero(value),
  });

/**
 * Exact equality: identical values (with NaN equal to itself, so equality is
 * reflexive) and structurally equal units. For float quantities this is
 * identity, not "approximately the same measurement"—domain logic and
 * tests usually want {@link equalsWithin} instead.
 */
export const equals = <U extends Unit.Unit>(
  a: Quantity<U>,
  b: Quantity<U>,
): boolean => valueEquals(a.value, b.value) && Unit.equals(a.unit, b.unit);

/**
 * Tolerance-based equality: whether `a` and `b` differ by no more than
 * `tolerance` (a quantity in the same units). Identical values—including
 * two equal infinities—are always equal within any tolerance; NaN is
 * never equal to anything.
 */
export const equalsWithin: {
  <U extends Unit.Unit>(
    b: Quantity<U>,
    tolerance: Quantity<U>,
  ): (a: Quantity<U>) => boolean;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    b: Quantity<U>,
    tolerance: Quantity<U>,
  ): boolean;
} = Function.dual(
  3,
  (
    a: Quantity<Unit.Unit>,
    b: Quantity<Unit.Unit>,
    tolerance: Quantity<Unit.Unit>,
  ): boolean =>
    a.value === b.value ||
    Math.abs(a.value - b.value) <= Math.abs(tolerance.value),
);

export const multiply: {
  <U extends Unit.Unit>(b: number): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: number): Quantity<U>;

  <U extends Unit.Unit>(b: Quantity<U>): (a: number) => Quantity<U>;
  <U extends Unit.Unit>(a: number, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (
    a: Quantity<Unit.Unit> | number,
    b: Quantity<Unit.Unit> | number,
  ): Quantity<Unit.Unit> =>
    Predicate.isNumber(a)
      ? make(
          (b as Quantity<Unit.Unit>).unit,
          a * (b as Quantity<Unit.Unit>).value,
        )
      : make(a.unit, a.value * (b as number)),
);

/** Division by zero yields ±Infinity (or NaN for 0/0). */
export const divide: {
  <U extends Unit.Unit>(b: number): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: number): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: number): Quantity<Unit.Unit> =>
    make(a.unit, a.value / b),
);

export const sum: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    make(a.unit, a.value + b.value),
);

export const subtract: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    make(a.unit, a.value - b.value),
);

/**
 * Multiplies two quantities, composing their units into a `Product`:
 * `times(length, length)` is an area.
 *
 * `Unitless` is the identity, so multiplying by a dimensionless quantity
 * scales instead of composing—`times(length, Dimensionless.percent(90))` is
 * nine tenths of that length, still a `Length`. Either argument may be the
 * dimensionless one.
 */
export const times: {
  (
    factor: Quantity<"Unitless">,
  ): <U extends Unit.Unit>(a: Quantity<U>) => Quantity<U>;
  <U2 extends Unit.Unit>(
    b: Quantity<U2>,
  ): <U1 extends Unit.Unit>(a: Quantity<U1>) => Quantity<Unit.Product<U1, U2>>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    factor: Quantity<"Unitless">,
  ): Quantity<U>;
  <U extends Unit.Unit>(
    factor: Quantity<"Unitless">,
    a: Quantity<U>,
  ): Quantity<U>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    a: Quantity<U1>,
    b: Quantity<U2>,
  ): Quantity<Unit.Product<U1, U2>>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    isUnitless(a.unit)
      ? make(b.unit, a.value * b.value)
      : isUnitless(b.unit)
        ? make(a.unit, a.value * b.value)
        : make(Unit.product(a.unit, b.unit), a.value * b.value),
);

// squared and cubed are `times` specialized to one argument, so they honor
// the same identity. Their implementations are cast to the overloaded type:
// a single implementation signature can never be assignable to an overload
// set, which is why `times` and `over` need no cast (`Function.dual` carries
// the annotation) and these two do.

const squaredImpl = (a: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
  isUnitless(a.unit)
    ? make(a.unit, a.value * a.value)
    : make(Unit.squared(a.unit), a.value * a.value);

/** Squaring a dimensionless quantity leaves it dimensionless. */
export const squared = squaredImpl as {
  (a: Quantity<"Unitless">): Quantity<"Unitless">;
  <U extends Unit.Unit>(a: Quantity<U>): Quantity<Unit.Squared<U>>;
};

const cubedImpl = (a: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
  isUnitless(a.unit)
    ? make(a.unit, a.value * a.value * a.value)
    : make(Unit.cubed(a.unit), a.value * a.value * a.value);

/** Cubing a dimensionless quantity leaves it dimensionless. */
export const cubed = cubedImpl as {
  (a: Quantity<"Unitless">): Quantity<"Unitless">;
  <U extends Unit.Unit>(a: Quantity<U>): Quantity<Unit.Cubed<U>>;
};

/**
 * Divides one quantity by another, producing a rate: `per(dependent,
 * independent)` is the rate of change of `dependent` per unit of
 * `independent` (e.g. `per(length, duration)` is a speed). Division by zero
 * yields ±Infinity (or NaN for 0/0).
 */
export const per: {
  <Independent extends Unit.Unit>(
    independent: Quantity<Independent>,
  ): <Dependent extends Unit.Unit>(
    dependent: Quantity<Dependent>,
  ) => Quantity<Unit.Rate<Dependent, Independent>>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: Quantity<Dependent>,
    independent: Quantity<Independent>,
  ): Quantity<Unit.Rate<Dependent, Independent>>;
} = Function.dual(
  2,
  (
    dependent: Quantity<Unit.Unit>,
    independent: Quantity<Unit.Unit>,
  ): Quantity<Unit.Rate<Unit.Unit, Unit.Unit>> =>
    make(
      Unit.rate(dependent.unit, independent.unit),
      dependent.value / independent.value,
    ),
);

/**
 * Multiplies a rate by a quantity in its independent units, producing a
 * quantity in its dependent units: `at(speed, duration)` is a length.
 */
export const at: {
  <Independent extends Unit.Unit>(
    independent: Quantity<Independent>,
  ): <Dependent extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
  ) => Quantity<Dependent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
    independent: Quantity<Independent>,
  ): Quantity<Dependent>;
} = Function.dual(
  2,
  (
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
    independent: Quantity<Unit.Unit>,
  ): Quantity<Unit.Unit> =>
    make(rate.unit.dependent, rate.value * independent.value),
);

/**
 * Divides a quantity in a rate's dependent units by the rate, producing a
 * quantity in its independent units: `at_(length, speed)` is a duration.
 * Division by zero yields ±Infinity (or NaN for 0/0).
 */
export const at_: {
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
  ): (dependent: Quantity<Dependent>) => Quantity<Independent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: Quantity<Dependent>,
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
  ): Quantity<Independent>;
} = Function.dual(
  2,
  (
    dependent: Quantity<Unit.Unit>,
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Quantity<Unit.Unit> =>
    make(rate.unit.independent, dependent.value / rate.value),
);

/**
 * `for_(duration, speed)` is the length covered at `speed` for `duration`—
 * {@link at} with its arguments flipped. (Named `for_` because `for` is a
 * reserved word.)
 */
export const for_: {
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
  ): (independent: Quantity<Independent>) => Quantity<Dependent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    independent: Quantity<Independent>,
    rate: Quantity<Unit.Rate<Dependent, Independent>>,
  ): Quantity<Dependent>;
} = Function.dual(
  2,
  (
    independent: Quantity<Unit.Unit>,
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Quantity<Unit.Unit> => at(rate, independent),
);

/**
 * Divides a product quantity by its right factor: `over(area, length)` is a
 * length.
 *
 * Dividing by a dimensionless quantity scales instead, staying in the units
 * it started in—the inverse of {@link times} in both cases. Division by zero
 * yields ±Infinity (or NaN for 0/0).
 */
export const over: {
  (
    factor: Quantity<"Unitless">,
  ): <U extends Unit.Unit>(a: Quantity<U>) => Quantity<U>;
  <U2 extends Unit.Unit>(
    b: Quantity<U2>,
  ): <U1 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Quantity<U1>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    factor: Quantity<"Unitless">,
  ): Quantity<U>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U2>,
  ): Quantity<U1>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    isUnitless(b.unit)
      ? make(a.unit, a.value / b.value)
      : make(
          (a.unit as Unit.Product<Unit.Unit, Unit.Unit>).left,
          a.value / b.value,
        ),
);

/**
 * Divides a product quantity by its left factor: `over_(area, length)` is a
 * length.
 *
 * A dimensionless divisor scales, exactly as it does in {@link over}—for a
 * pure number there is no left or right factor to choose between. Division
 * by zero yields ±Infinity (or NaN for 0/0).
 */
export const over_: {
  (
    factor: Quantity<"Unitless">,
  ): <U extends Unit.Unit>(a: Quantity<U>) => Quantity<U>;
  <U1 extends Unit.Unit>(
    b: Quantity<U1>,
  ): <U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Quantity<U2>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    factor: Quantity<"Unitless">,
  ): Quantity<U>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U1>,
  ): Quantity<U2>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    isUnitless(b.unit)
      ? make(a.unit, a.value / b.value)
      : make(
          (a.unit as Unit.Product<Unit.Unit, Unit.Unit>).right,
          a.value / b.value,
        ),
);

// Dimensionless quantities
//
// `times`, `over`, `over_`, `squared`, and `cubed` already fold `Unitless`
// away as the identity, so a dimensionless factor needs no separate
// operation. What is left is the way in: `ratio`, which divides two
// quantities in the same units and returns the pure number rather than the
// `Rate<U, U>` that `per` would build.
//
// See the `Dimensionless` module for the constructors (`fraction`,
// `percent`, …) that read and write `Unitless` values; it is not imported
// here, since the dependency runs the other way.

/**
 * Divides two quantities in the same units, producing a dimensionless
 * quantity—`ratio(marathon, kilometer)` is a factor of 42.1648128, and the
 * units it was measured in are gone. Contrast {@link per}, which keeps them
 * as a rate. Division by zero yields ±Infinity (or NaN for 0/0).
 *
 * Read the result with `Dimensionless.inFraction` or `inPercent`.
 */
export const ratio: {
  <U extends Unit.Unit>(
    b: Quantity<U>,
  ): (a: Quantity<U>) => Quantity<"Unitless">;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<"Unitless">;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<"Unitless"> =>
    make("Unitless", a.value / b.value),
);

// Comparison
//
// The ordering predicates follow IEEE semantics for NaN: every comparison
// involving NaN is false. min and max propagate NaN deterministically, like
// Math.min/Math.max.

export const isLessThan: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => boolean;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): boolean;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): boolean =>
    a.value < b.value,
);

export const isLessThanOrEqualTo: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => boolean;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): boolean;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): boolean =>
    a.value <= b.value,
);

export const isGreaterThan: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => boolean;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): boolean;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): boolean =>
    a.value > b.value,
);

export const isGreaterThanOrEqualTo: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => boolean;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): boolean;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): boolean =>
    a.value >= b.value,
);

/** Propagates NaN: if either argument is NaN, the NaN quantity is returned. */
export const min: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    Number.isNaN(a.value)
      ? a
      : Number.isNaN(b.value)
        ? b
        : b.value < a.value
          ? b
          : a,
);

/** Propagates NaN: if either argument is NaN, the NaN quantity is returned. */
export const max: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    Number.isNaN(a.value)
      ? a
      : Number.isNaN(b.value)
        ? b
        : b.value > a.value
          ? b
          : a,
);

// Guards

export const isNaN = <U extends Unit.Unit>(q: Quantity<U>): boolean =>
  Number.isNaN(q.value);

export const isInfinite = <U extends Unit.Unit>(q: Quantity<U>): boolean =>
  q.value === Infinity || q.value === -Infinity;

export const isFinite = <U extends Unit.Unit>(q: Quantity<U>): boolean =>
  Number.isFinite(q.value);
