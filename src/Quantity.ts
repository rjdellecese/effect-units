import * as BigDecimal from "effect/BigDecimal";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import * as Unit from "./Unit";

export const TypeId = Symbol.for("effect-units/Quantity");
export type TypeId = typeof TypeId;

export const QuantityFromSelf = <const U extends Unit.Unit>(unit: U) =>
  Schema.declare((u: unknown): u is Quantity<U> => isQuantity(unit)(u));

export const Quantity = <const U extends Unit.Unit>(unit: U) =>
  Schema.transformOrFail(
    Schema.Struct({
      unit: Schema.Literal(Unit.print(unit)),
      value: Schema.String,
    }),
    QuantityFromSelf(unit),
    {
      decode: ({ value }) =>
        Effect.gen(function* () {
          return make(
            unit,
            yield* ParseResult.decode(Schema.BigDecimal)(value),
          );
        }),
      encode: ({ value }) =>
        Effect.gen(function* () {
          return {
            unit: Unit.print(unit),
            value: yield* ParseResult.encode(Schema.BigDecimal)(value),
          };
        }),
    },
  );

export interface Quantity<U extends Unit.Unit>
  extends Equal.Equal, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly unit: U;
  readonly value: BigDecimal.BigDecimal;
}

const isQuantity =
  <U extends Unit.Unit = Unit.Unit>(unit?: U) =>
  (u: unknown): u is Quantity<U> =>
    Predicate.hasProperty(u, TypeId) &&
    (unit
      ? Predicate.hasProperty(u, "unit") &&
        Unit.isUnit(u.unit) &&
        Unit.equals(u.unit, unit)
      : true);

const Proto = {
  [TypeId]: TypeId,
  [Equal.symbol](this: Quantity<Unit.Unit>, that: unknown): boolean {
    return isQuantity()(that) && equals(this, that);
  },
  [Hash.symbol](this: Quantity<Unit.Unit>): number {
    return Hash.combine(Hash.string(Unit.print(this.unit)))(
      Hash.hash(this.value),
    );
  },
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
} as const;

export const make = <U extends Unit.Unit>(
  unit: U,
  value: BigDecimal.BigDecimal,
): Quantity<U> =>
  Object.assign(Object.create(Proto), {
    unit,
    value,
  });

export const equals = <U extends Unit.Unit>(
  a: Quantity<U>,
  b: Quantity<U>,
): boolean => Equal.equals(a.value, b.value) && Unit.equals(a.unit, b.unit);

export const multiply: {
  <U extends Unit.Unit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Quantity<U>;

  <U extends Unit.Unit>(
    b: Quantity<U>,
  ): (a: BigDecimal.BigDecimal) => Quantity<U>;
  <U extends Unit.Unit>(
    a: BigDecimal.BigDecimal,
    b: Quantity<U>,
  ): Quantity<U>;
} = Function.dual(
  2,
  (
    a: Quantity<Unit.Unit> | BigDecimal.BigDecimal,
    b: Quantity<Unit.Unit> | BigDecimal.BigDecimal,
  ): Quantity<Unit.Unit> =>
    Match.value({ a, b }).pipe(
      Match.when(
        { a: isQuantity(), b: BigDecimal.isBigDecimal },
        ({ a: a_, b: b_ }) => make(a_.unit, BigDecimal.multiply(a_.value, b_)),
      ),
      Match.when(
        { a: BigDecimal.isBigDecimal, b: isQuantity() },
        ({ a: a_, b: b_ }) => make(b_.unit, BigDecimal.multiply(a_, b_.value)),
      ),
      Match.orElseAbsurd,
    ),
);

export const unsafeDivide: {
  <U extends Unit.Unit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Quantity<U>;
} = Function.dual(
  2,
  (
    a: Quantity<Unit.Unit>,
    b: BigDecimal.BigDecimal,
  ): Quantity<Unit.Unit> =>
    make(a.unit, BigDecimal.unsafeDivide(a.value, b)),
);

export const divide: {
  <U extends Unit.Unit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Option.Option<Quantity<U>>;
  <U extends Unit.Unit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Option.Option<Quantity<U>>;
} = Function.dual(
  2,
  (
    a: Quantity<Unit.Unit>,
    b: BigDecimal.BigDecimal,
  ): Option.Option<Quantity<Unit.Unit>> =>
    BigDecimal.divide(a.value, b).pipe(
      Option.map((value) => make(a.unit, value)),
    ),
);

export const sum: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    make(a.unit, BigDecimal.sum(a.value, b.value)),
);

export const subtract: {
  <U extends Unit.Unit>(b: Quantity<U>): (a: Quantity<U>) => Quantity<U>;
  <U extends Unit.Unit>(a: Quantity<U>, b: Quantity<U>): Quantity<U>;
} = Function.dual(
  2,
  (a: Quantity<Unit.Unit>, b: Quantity<Unit.Unit>): Quantity<Unit.Unit> =>
    make(a.unit, BigDecimal.subtract(a.value, b.value)),
);

export const times: {
  <U2 extends Unit.Unit>(
    b: Quantity<U2>,
  ): <U1 extends Unit.Unit>(
    a: Quantity<U1>,
  ) => Quantity<Unit.Product<U1, U2>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    a: Quantity<U1>,
    b: Quantity<U2>,
  ): Quantity<Unit.Product<U1, U2>>;
} = Function.dual(
  2,
  (
    a: Quantity<Unit.Unit>,
    b: Quantity<Unit.Unit>,
  ): Quantity<Unit.Product<Unit.Unit, Unit.Unit>> =>
    make(Unit.product(a.unit, b.unit), BigDecimal.multiply(a.value, b.value)),
);

export const squared = <U extends Unit.Unit>(
  a: Quantity<U>,
): Quantity<Unit.Squared<U>> =>
  make(Unit.squared(a.unit), BigDecimal.multiply(a.value, a.value));

export const cubed = <U extends Unit.Unit>(
  a: Quantity<U>,
): Quantity<Unit.Cubed<U>> =>
  make(
    Unit.cubed(a.unit),
    BigDecimal.multiply(BigDecimal.multiply(a.value, a.value), a.value),
  );

/**
 * Divides one quantity by another, producing a rate: `per(dep, indep)` is the
 * rate of change of `dep` per unit of `indep` (e.g. `per(length, duration)`
 * is a speed). Returns `Option.none()` when `indep` is zero. Non-terminating
 * quotients are rounded (at 100 significant digits, by `BigDecimal.divide`).
 */
export const per: {
  <Indep extends Unit.Unit>(
    indep: Quantity<Indep>,
  ): <Dep extends Unit.Unit>(
    dep: Quantity<Dep>,
  ) => Option.Option<Quantity<Unit.Rate<Dep, Indep>>>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    dep: Quantity<Dep>,
    indep: Quantity<Indep>,
  ): Option.Option<Quantity<Unit.Rate<Dep, Indep>>>;
} = Function.dual(
  2,
  (
    dep: Quantity<Unit.Unit>,
    indep: Quantity<Unit.Unit>,
  ): Option.Option<Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>> =>
    BigDecimal.divide(dep.value, indep.value).pipe(
      Option.map((value) => make(Unit.rate(dep.unit, indep.unit), value)),
    ),
);

/** Like {@link per}, but throws when `indep` is zero. */
export const unsafePer: {
  <Indep extends Unit.Unit>(
    indep: Quantity<Indep>,
  ): <Dep extends Unit.Unit>(
    dep: Quantity<Dep>,
  ) => Quantity<Unit.Rate<Dep, Indep>>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    dep: Quantity<Dep>,
    indep: Quantity<Indep>,
  ): Quantity<Unit.Rate<Dep, Indep>>;
} = Function.dual(
  2,
  (
    dep: Quantity<Unit.Unit>,
    indep: Quantity<Unit.Unit>,
  ): Quantity<Unit.Rate<Unit.Unit, Unit.Unit>> =>
    make(
      Unit.rate(dep.unit, indep.unit),
      BigDecimal.unsafeDivide(dep.value, indep.value),
    ),
);

/**
 * Multiplies a rate by a quantity in its independent units, producing a
 * quantity in its dependent units: `at(speed, duration)` is a length.
 */
export const at: {
  <Indep extends Unit.Unit>(
    indep: Quantity<Indep>,
  ): <Dep extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ) => Quantity<Dep>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dep, Indep>>,
    indep: Quantity<Indep>,
  ): Quantity<Dep>;
} = Function.dual(
  2,
  (
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
    indep: Quantity<Unit.Unit>,
  ): Quantity<Unit.Unit> =>
    make(rate.unit.dependent, BigDecimal.multiply(rate.value, indep.value)),
);

/**
 * Divides a quantity in a rate's dependent units by the rate, producing a
 * quantity in its independent units: `at_(length, speed)` is a duration.
 * Returns `Option.none()` when the rate is zero.
 */
export const at_: {
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): (dep: Quantity<Dep>) => Option.Option<Quantity<Indep>>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    dep: Quantity<Dep>,
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): Option.Option<Quantity<Indep>>;
} = Function.dual(
  2,
  (
    dep: Quantity<Unit.Unit>,
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Option.Option<Quantity<Unit.Unit>> =>
    BigDecimal.divide(dep.value, rate.value).pipe(
      Option.map((value) => make(rate.unit.independent, value)),
    ),
);

/** Like {@link at_}, but throws when the rate is zero. */
export const unsafeAt_: {
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): (dep: Quantity<Dep>) => Quantity<Indep>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    dep: Quantity<Dep>,
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): Quantity<Indep>;
} = Function.dual(
  2,
  (
    dep: Quantity<Unit.Unit>,
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Quantity<Unit.Unit> =>
    make(
      rate.unit.independent,
      BigDecimal.unsafeDivide(dep.value, rate.value),
    ),
);

/**
 * `for_(duration, speed)` is the length covered at `speed` for `duration` —
 * {@link at} with its arguments flipped. (Named `for_` because `for` is a
 * reserved word.)
 */
export const for_: {
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): (indep: Quantity<Indep>) => Quantity<Dep>;
  <Dep extends Unit.Unit, Indep extends Unit.Unit>(
    indep: Quantity<Indep>,
    rate: Quantity<Unit.Rate<Dep, Indep>>,
  ): Quantity<Dep>;
} = Function.dual(
  2,
  (
    indep: Quantity<Unit.Unit>,
    rate: Quantity<Unit.Rate<Unit.Unit, Unit.Unit>>,
  ): Quantity<Unit.Unit> =>
    make(rate.unit.dependent, BigDecimal.multiply(rate.value, indep.value)),
);

/**
 * Divides a product quantity by its right factor: `over(area, length)` is a
 * length. Returns `Option.none()` when the divisor is zero.
 */
export const over: {
  <U2 extends Unit.Unit>(
    b: Quantity<U2>,
  ): <U1 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Option.Option<Quantity<U1>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U2>,
  ): Option.Option<Quantity<U1>>;
} = Function.dual(
  2,
  (
    product: Quantity<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: Quantity<Unit.Unit>,
  ): Option.Option<Quantity<Unit.Unit>> =>
    BigDecimal.divide(product.value, b.value).pipe(
      Option.map((value) => make(product.unit.left, value)),
    ),
);

/** Like {@link over}, but throws when the divisor is zero. */
export const unsafeOver: {
  <U2 extends Unit.Unit>(
    b: Quantity<U2>,
  ): <U1 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Quantity<U1>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U2>,
  ): Quantity<U1>;
} = Function.dual(
  2,
  (
    product: Quantity<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: Quantity<Unit.Unit>,
  ): Quantity<Unit.Unit> =>
    make(product.unit.left, BigDecimal.unsafeDivide(product.value, b.value)),
);

/**
 * Divides a product quantity by its left factor: `over_(area, length)` is a
 * length. Returns `Option.none()` when the divisor is zero.
 */
export const over_: {
  <U1 extends Unit.Unit>(
    b: Quantity<U1>,
  ): <U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Option.Option<Quantity<U2>>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U1>,
  ): Option.Option<Quantity<U2>>;
} = Function.dual(
  2,
  (
    product: Quantity<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: Quantity<Unit.Unit>,
  ): Option.Option<Quantity<Unit.Unit>> =>
    BigDecimal.divide(product.value, b.value).pipe(
      Option.map((value) => make(product.unit.right, value)),
    ),
);

/** Like {@link over_}, but throws when the divisor is zero. */
export const unsafeOver_: {
  <U1 extends Unit.Unit>(
    b: Quantity<U1>,
  ): <U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
  ) => Quantity<U2>;
  <U1 extends Unit.Unit, U2 extends Unit.Unit>(
    product: Quantity<Unit.Product<U1, U2>>,
    b: Quantity<U1>,
  ): Quantity<U2>;
} = Function.dual(
  2,
  (
    product: Quantity<Unit.Product<Unit.Unit, Unit.Unit>>,
    b: Quantity<Unit.Unit>,
  ): Quantity<Unit.Unit> =>
    make(product.unit.right, BigDecimal.unsafeDivide(product.value, b.value)),
);
