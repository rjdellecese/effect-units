import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import { ValueObjectProto } from "./internal/valueObject.ts";
import * as Quantity from "./Quantity.ts";
import * as Rational from "./Rational.ts";
import * as Unit from "./Unit.ts";

export const TypeId = Symbol.for("effect-units/QuantityExact");
export type TypeId = typeof TypeId;

export const QuantityExactFromSelf = <const U extends Unit.Unit>(unit: U) =>
  Schema.declare(hasUnit(unit));

/**
 * The wire format is `{ unit, value }` with the value in the canonical
 * rational encoding (`"3/2"`, `"-3/2"`, `"3"`)—exact on the wire, with no
 * width or precision ceiling.
 */
export const QuantityExact = <const U extends Unit.Unit>(unit: U) =>
  Schema.Struct({
    unit: Schema.Literal(Unit.encode(unit)),
    value: Rational.Rational,
  }).pipe(
    Schema.decodeTo(
      QuantityExactFromSelf(unit),
      SchemaTransformation.transform({
        decode: ({ value }) => make(unit, value),
        encode: ({ value }) => ({ unit: Unit.encode(unit), value }),
      }),
    ),
  );

/**
 * An exact quantity is an arbitrary-precision rational tagged with a unit
 * tree. All arithmetic is exact; the operations that divide return `Option`
 * (ℚ has no infinities or NaN), and rounding happens only at explicitly
 * parameterized boundaries like {@link toQuantity} and `Rational`'s
 * conversions.
 */
export interface QuantityExact<U extends Unit.Unit>
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly unit: U;
  readonly value: Rational.Rational;
}

const isQuantityExact = (u: unknown): u is QuantityExact<Unit.Unit> =>
  Predicate.hasProperty(u, TypeId);

const hasUnit =
  <U extends Unit.Unit>(unit: U) =>
  (u: unknown): u is QuantityExact<U> =>
    isQuantityExact(u) && Unit.equals(u.unit, unit);

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: QuantityExact<Unit.Unit>, that: unknown): boolean {
    return isQuantityExact(that) && equals(this, that);
  },
  [Hash.symbol](this: QuantityExact<Unit.Unit>): number {
    return Hash.combine(Hash.string(Unit.encode(this.unit)))(
      Hash.hash(this.value),
    );
  },
  toJSON(this: QuantityExact<Unit.Unit>) {
    return {
      _id: "QuantityExact",
      unit: Unit.encode(this.unit),
      value: Rational.format(this.value),
    };
  },
} as const;

export const make = <U extends Unit.Unit>(
  unit: U,
  value: Rational.Rational,
): QuantityExact<U> => Object.assign(Object.create(Proto), { unit, value });

/**
 * Exact equality: equal rational values and structurally equal units.
 * Unlike the float module, this is decidable with no caveats—equivalent
 * fractions are one value, and there is no NaN.
 */
export const equals = <U extends Unit.Unit>(
  a: QuantityExact<U>,
  b: QuantityExact<U>,
): boolean => Rational.equals(a.value, b.value) && Unit.equals(a.unit, b.unit);

/**
 * Tolerance-based equality: whether `a` and `b` differ by no more than
 * `tolerance` (a quantity in the same units). Exact and total—kept for
 * domain logic that genuinely wants a tolerance, not as a float workaround.
 */
export const equalsWithin: {
  <U extends Unit.Unit>(
    b: QuantityExact<U>,
    tolerance: QuantityExact<U>,
  ): (a: QuantityExact<U>) => boolean;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: QuantityExact<U>,
    tolerance: QuantityExact<U>,
  ): boolean;
} = Function.dual(
  3,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
    tolerance: QuantityExact<Unit.Unit>,
  ): boolean =>
    Rational.lessThanOrEqualTo(
      Rational.abs(Rational.subtract(a.value, b.value)),
      Rational.abs(tolerance.value),
    ),
);

export const multiply: {
  <U extends Unit.Unit>(
    b: Rational.Rational,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: Rational.Rational,
  ): QuantityExact<U>;

  <U extends Unit.Unit>(
    b: QuantityExact<U>,
  ): (a: Rational.Rational) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: Rational.Rational,
    b: QuantityExact<U>,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit> | Rational.Rational,
    b: QuantityExact<Unit.Unit> | Rational.Rational,
  ): QuantityExact<Unit.Unit> =>
    Rational.isRational(a)
      ? make(
          (b as QuantityExact<Unit.Unit>).unit,
          Rational.multiply(a, (b as QuantityExact<Unit.Unit>).value),
        )
      : make(a.unit, Rational.multiply(a.value, b as Rational.Rational)),
);

/** Returns `Option.none()` when the divisor is zero—ℚ has no infinities. */
export const divide: {
  <U extends Unit.Unit>(
    b: Rational.Rational,
  ): (a: QuantityExact<U>) => Option.Option<QuantityExact<U>>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: Rational.Rational,
  ): Option.Option<QuantityExact<U>>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: Rational.Rational,
  ): Option.Option<QuantityExact<Unit.Unit>> =>
    Option.map(Rational.divide(a.value, b), (value) => make(a.unit, value)),
);

/** Throws a `RangeError` when the divisor is zero. */
export const divideUnsafe: {
  <U extends Unit.Unit>(
    b: Rational.Rational,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: Rational.Rational,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: Rational.Rational,
  ): QuantityExact<Unit.Unit> =>
    make(a.unit, Rational.divideUnsafe(a.value, b)),
);

export const sum: {
  <U extends Unit.Unit>(
    b: QuantityExact<U>,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: QuantityExact<U>,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> => make(a.unit, Rational.sum(a.value, b.value)),
);

export const subtract: {
  <U extends Unit.Unit>(
    b: QuantityExact<U>,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: QuantityExact<U>,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> =>
    make(a.unit, Rational.subtract(a.value, b.value)),
);

export const times: {
  <U2 extends Unit.Unit>(
    b: QuantityExact<U2>,
  ): <U1 extends Unit.Unit>(
    a: QuantityExact<U1>,
  ) => QuantityExact<Unit.Product<U1, U2>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    a: QuantityExact<U1>,
    b: QuantityExact<U2>,
  ): QuantityExact<Unit.Product<U1, U2>>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Product<Unit.Unit, Unit.Unit>> =>
    make(Unit.product(a.unit, b.unit), Rational.multiply(a.value, b.value)),
);

export const squared = <U extends Unit.Unit>(
  a: QuantityExact<U>,
): QuantityExact<Unit.Squared<U>> =>
  make(Unit.squared(a.unit), Rational.multiply(a.value, a.value));

export const cubed = <U extends Unit.Unit>(
  a: QuantityExact<U>,
): QuantityExact<Unit.Cubed<U>> =>
  make(
    Unit.cubed(a.unit),
    Rational.multiply(Rational.multiply(a.value, a.value), a.value),
  );

/**
 * Divides one quantity by another, producing a rate: `per(dependent,
 * independent)` is the rate of change of `dependent` per unit of
 * `independent` (e.g. `per(length, duration)` is a speed). Returns
 * `Option.none()` when the independent quantity is zero—ℚ has no
 * infinities to divide into.
 */
export const per: {
  <Independent extends Unit.Unit>(
    independent: QuantityExact<Independent>,
  ): <Dependent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
  ) => Option.Option<QuantityExact<Unit.Rate<Dependent, Independent>>>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
    independent: QuantityExact<Independent>,
  ): Option.Option<QuantityExact<Unit.Rate<Dependent, Independent>>>;
} = Function.dual(
  2,
  (
    dependent: QuantityExact<Unit.Unit>,
    independent: QuantityExact<Unit.Unit>,
  ): Option.Option<QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>>> =>
    Option.map(Rational.divide(dependent.value, independent.value), (value) =>
      make(Unit.rate(dependent.unit, independent.unit), value),
    ),
);

/** {@link per}, throwing a `RangeError` when the independent quantity is zero. */
export const perUnsafe: {
  <Independent extends Unit.Unit>(
    independent: QuantityExact<Independent>,
  ): <Dependent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
  ) => QuantityExact<Unit.Rate<Dependent, Independent>>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
    independent: QuantityExact<Independent>,
  ): QuantityExact<Unit.Rate<Dependent, Independent>>;
} = Function.dual(
  2,
  (
    dependent: QuantityExact<Unit.Unit>,
    independent: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>> =>
    make(
      Unit.rate(dependent.unit, independent.unit),
      Rational.divideUnsafe(dependent.value, independent.value),
    ),
);

/**
 * Multiplies a rate by a quantity in its independent units, producing a
 * quantity in its dependent units: `at(speed, duration)` is a length.
 */
export const at: {
  <Independent extends Unit.Unit>(
    independent: QuantityExact<Independent>,
  ): <Dependent extends Unit.Unit>(
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ) => QuantityExact<Dependent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
    independent: QuantityExact<Independent>,
  ): QuantityExact<Dependent>;
} = Function.dual(
  2,
  (
    rate: QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>>,
    independent: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> =>
    make(rate.unit.dependent, Rational.multiply(rate.value, independent.value)),
);

/**
 * Divides a quantity in a rate's dependent units by the rate, producing a
 * quantity in its independent units: `at_(length, speed)` is a duration.
 * Returns `Option.none()` when the rate is zero.
 */
export const at_: {
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): (
    dependent: QuantityExact<Dependent>,
  ) => Option.Option<QuantityExact<Independent>>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): Option.Option<QuantityExact<Independent>>;
} = Function.dual(
  2,
  (
    dependent: QuantityExact<Unit.Unit>,
    rate: QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Option.Option<QuantityExact<Unit.Unit>> =>
    Option.map(Rational.divide(dependent.value, rate.value), (value) =>
      make(rate.unit.independent, value),
    ),
);

/** {@link at_}, throwing a `RangeError` when the rate is zero. */
export const at_Unsafe: {
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): (dependent: QuantityExact<Dependent>) => QuantityExact<Independent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    dependent: QuantityExact<Dependent>,
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): QuantityExact<Independent>;
} = Function.dual(
  2,
  (
    dependent: QuantityExact<Unit.Unit>,
    rate: QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): QuantityExact<Unit.Unit> =>
    make(
      rate.unit.independent,
      Rational.divideUnsafe(dependent.value, rate.value),
    ),
);

/**
 * `for_(duration, speed)` is the length covered at `speed` for `duration`—
 * {@link at} with its arguments flipped. (Named `for_` because `for` is a
 * reserved word.)
 */
export const for_: {
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): (independent: QuantityExact<Independent>) => QuantityExact<Dependent>;
  <Dependent extends Unit.Unit, Independent extends Unit.Unit>(
    independent: QuantityExact<Independent>,
    rate: QuantityExact<Unit.Rate<Dependent, Independent>>,
  ): QuantityExact<Dependent>;
} = Function.dual(
  2,
  (
    independent: QuantityExact<Unit.Unit>,
    rate: QuantityExact<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): QuantityExact<Unit.Unit> => at(rate, independent),
);

/**
 * Divides a product quantity by its right factor: `over(area, length)` is a
 * length. Returns `Option.none()` when the divisor is zero.
 */
export const over: {
  <U2 extends Unit.Unit>(
    b: QuantityExact<U2>,
  ): <U1 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
  ) => Option.Option<QuantityExact<U1>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
    b: QuantityExact<U2>,
  ): Option.Option<QuantityExact<U1>>;
} = Function.dual(
  2,
  (
    product: QuantityExact<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: QuantityExact<Unit.Unit>,
  ): Option.Option<QuantityExact<Unit.Unit>> =>
    Option.map(Rational.divide(product.value, b.value), (value) =>
      make(product.unit.left, value),
    ),
);

/** {@link over}, throwing a `RangeError` when the divisor is zero. */
export const overUnsafe: {
  <U2 extends Unit.Unit>(
    b: QuantityExact<U2>,
  ): <U1 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
  ) => QuantityExact<U1>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
    b: QuantityExact<U2>,
  ): QuantityExact<U1>;
} = Function.dual(
  2,
  (
    product: QuantityExact<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> =>
    make(product.unit.left, Rational.divideUnsafe(product.value, b.value)),
);

/**
 * Divides a product quantity by its left factor: `over_(area, length)` is a
 * length. Returns `Option.none()` when the divisor is zero.
 */
export const over_: {
  <U1 extends Unit.Unit>(
    b: QuantityExact<U1>,
  ): <U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
  ) => Option.Option<QuantityExact<U2>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
    b: QuantityExact<U1>,
  ): Option.Option<QuantityExact<U2>>;
} = Function.dual(
  2,
  (
    product: QuantityExact<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: QuantityExact<Unit.Unit>,
  ): Option.Option<QuantityExact<Unit.Unit>> =>
    Option.map(Rational.divide(product.value, b.value), (value) =>
      make(product.unit.right, value),
    ),
);

/** {@link over_}, throwing a `RangeError` when the divisor is zero. */
export const over_Unsafe: {
  <U1 extends Unit.Unit>(
    b: QuantityExact<U1>,
  ): <U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
  ) => QuantityExact<U2>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: QuantityExact<Unit.Product<U1, U2>>,
    b: QuantityExact<U1>,
  ): QuantityExact<U2>;
} = Function.dual(
  2,
  (
    product: QuantityExact<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> =>
    make(product.unit.right, Rational.divideUnsafe(product.value, b.value)),
);

// Comparison
//
// Rationals are totally ordered, so the ordering predicates are total —
// there is no NaN and no partial branch.

export const lessThan: {
  <U extends Unit.Unit>(b: QuantityExact<U>): (a: QuantityExact<U>) => boolean;
  <U extends Unit.Unit>(a: QuantityExact<U>, b: QuantityExact<U>): boolean;
} = Function.dual(
  2,
  (a: QuantityExact<Unit.Unit>, b: QuantityExact<Unit.Unit>): boolean =>
    Rational.lessThan(a.value, b.value),
);

export const lessThanOrEqualTo: {
  <U extends Unit.Unit>(b: QuantityExact<U>): (a: QuantityExact<U>) => boolean;
  <U extends Unit.Unit>(a: QuantityExact<U>, b: QuantityExact<U>): boolean;
} = Function.dual(
  2,
  (a: QuantityExact<Unit.Unit>, b: QuantityExact<Unit.Unit>): boolean =>
    Rational.lessThanOrEqualTo(a.value, b.value),
);

export const greaterThan: {
  <U extends Unit.Unit>(b: QuantityExact<U>): (a: QuantityExact<U>) => boolean;
  <U extends Unit.Unit>(a: QuantityExact<U>, b: QuantityExact<U>): boolean;
} = Function.dual(
  2,
  (a: QuantityExact<Unit.Unit>, b: QuantityExact<Unit.Unit>): boolean =>
    Rational.greaterThan(a.value, b.value),
);

export const greaterThanOrEqualTo: {
  <U extends Unit.Unit>(b: QuantityExact<U>): (a: QuantityExact<U>) => boolean;
  <U extends Unit.Unit>(a: QuantityExact<U>, b: QuantityExact<U>): boolean;
} = Function.dual(
  2,
  (a: QuantityExact<Unit.Unit>, b: QuantityExact<Unit.Unit>): boolean =>
    Rational.greaterThanOrEqualTo(a.value, b.value),
);

export const min: {
  <U extends Unit.Unit>(
    b: QuantityExact<U>,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: QuantityExact<U>,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> => (Rational.lessThan(b.value, a.value) ? b : a),
);

export const max: {
  <U extends Unit.Unit>(
    b: QuantityExact<U>,
  ): (a: QuantityExact<U>) => QuantityExact<U>;
  <U extends Unit.Unit>(
    a: QuantityExact<U>,
    b: QuantityExact<U>,
  ): QuantityExact<U>;
} = Function.dual(
  2,
  (
    a: QuantityExact<Unit.Unit>,
    b: QuantityExact<Unit.Unit>,
  ): QuantityExact<Unit.Unit> =>
    Rational.greaterThan(b.value, a.value) ? b : a,
);

// Interop
//
// Crossing between the float and exact worlds is always explicit. Going
// exact is lossless (every finite double is a dyadic rational); coming back
// is one correct rounding.

/**
 * The exact image of a float quantity—lossless, since every finite double
 * is a dyadic rational. Returns `Option.none()` for NaN and ±Infinity,
 * which have no rational image.
 */
export const fromQuantity = <U extends Unit.Unit>(
  q: Quantity.Quantity<U>,
): Option.Option<QuantityExact<U>> =>
  Option.map(Rational.fromNumber(q.value), (value) => make(q.unit, value));

/** Throws a `RangeError` on NaN and ±Infinity values. */
export const fromQuantityUnsafe = <U extends Unit.Unit>(
  q: Quantity.Quantity<U>,
): QuantityExact<U> => make(q.unit, Rational.fromNumberUnsafe(q.value));

/**
 * The float quantity nearest the exact one—a single correct rounding.
 * Returns `Option.none()` when the value overflows to ±Infinity.
 */
export const toQuantity = <U extends Unit.Unit>(
  q: QuantityExact<U>,
): Option.Option<Quantity.Quantity<U>> =>
  Option.map(Rational.toNumber(q.value), (value) =>
    Quantity.make(q.unit, value),
  );

/** Throws a `RangeError` when the value overflows to ±Infinity. */
export const toQuantityUnsafe = <U extends Unit.Unit>(
  q: QuantityExact<U>,
): Quantity.Quantity<U> =>
  Quantity.make(q.unit, Rational.toNumberUnsafe(q.value));
