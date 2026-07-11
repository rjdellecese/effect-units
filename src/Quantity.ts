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

import * as BaseUnit from "./BaseUnit";
import * as Squared from "./Squared";

export const TypeId = Symbol.for("effect-units/Quantity");
export type TypeId = typeof TypeId;

export const QuantityFromSelf = <U extends BaseUnit.BaseUnit>(unit: U) =>
  Schema.declare((u: unknown): u is Quantity<U> => isQuantity(unit)(u));

export const Quantity = <U extends BaseUnit.BaseUnit>(unit: U) =>
  Schema.transformOrFail(
    Schema.Struct({
      unit: Schema.Literal(unit),
      value: Schema.String,
    }),
    QuantityFromSelf(unit),
    {
      decode: ({ unit, value }) =>
        Effect.gen(function* () {
          return make(
            unit,
            yield* ParseResult.decode(Schema.BigDecimal)(value),
          );
        }),
      encode: ({ unit, value }) =>
        Effect.gen(function* () {
          return {
            unit,
            value: yield* ParseResult.encode(Schema.BigDecimal)(value),
          };
        }),
    },
  );

export interface Quantity<U extends BaseUnit.BaseUnit>
  extends Equal.Equal, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  readonly unit: U;
  readonly value: BigDecimal.BigDecimal;
}

export const Length = Quantity("Meters");
export const LengthFromSelf = QuantityFromSelf("Meters");

export const Mass = Quantity("Grams");
export const MassFromSelf = QuantityFromSelf("Grams");

export declare namespace Quantity {
  export type From<U extends BaseUnit.BaseUnit> =
    Quantity<U> extends Length ? Length : Quantity<U>;

  export type Length = typeof Length.Type;
  export type Mass = typeof Mass.Type;
}

const isQuantity =
  <U extends BaseUnit.BaseUnit = BaseUnit.BaseUnit>(unit?: U) =>
  (u: unknown): u is Quantity<U> =>
    Predicate.hasProperty(u, TypeId) &&
    (unit ? Predicate.hasProperty(u, "unit") && u.unit === unit : true);

const Proto = {
  [TypeId]: TypeId,
  [Equal.symbol](this: Quantity<BaseUnit.BaseUnit>, that: unknown): boolean {
    return isQuantity()(that) && equals(this, that);
  },
  [Hash.symbol](this: Quantity<BaseUnit.BaseUnit>): number {
    return Hash.hash(this.value);
  },
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
} as const;

export const make = <U extends BaseUnit.BaseUnit>(
  unit: U,
  value: BigDecimal.BigDecimal,
): Quantity<U> =>
  Object.assign(Object.create(Proto), {
    unit,
    value,
  });

export const equals = <U extends BaseUnit.BaseUnit>(
  a: Quantity<U>,
  b: Quantity<U>,
): boolean => Equal.equals(a.value, b.value) && Equal.equals(a.unit, b.unit);

export const multiply: {
  <U extends BaseUnit.BaseUnit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Quantity<U>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Quantity<U>;

  <U extends BaseUnit.BaseUnit>(
    b: Quantity<U>,
  ): (a: BigDecimal.BigDecimal) => Quantity<U>;
  <U extends BaseUnit.BaseUnit>(
    a: BigDecimal.BigDecimal,
    b: Quantity<U>,
  ): Quantity<U>;

  <U extends BaseUnit.BaseUnit>(
    b: Quantity<U>,
  ): (a: Quantity<U>) => Squared.Squared<U>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: Quantity<U>,
  ): Squared.Squared<U>;
} = Function.dual(
  2,
  (
    a: Quantity<BaseUnit.BaseUnit> | BigDecimal.BigDecimal,
    b: Quantity<BaseUnit.BaseUnit> | BigDecimal.BigDecimal,
  ): Squared.Squared<BaseUnit.BaseUnit> | Quantity<BaseUnit.BaseUnit> =>
    Match.value({ a, b }).pipe(
      Match.when(
        { a: isQuantity(), b: BigDecimal.isBigDecimal },
        ({ a: a_, b: b_ }) => make(a_.unit, BigDecimal.multiply(a_.value, b_)),
      ),
      Match.when(
        { a: BigDecimal.isBigDecimal, b: isQuantity() },
        ({ a: a_, b: b_ }) => make(b_.unit, BigDecimal.multiply(a_, b_.value)),
      ),
      Match.when({ a: isQuantity(), b: isQuantity() }, ({ a: a_, b: b_ }) =>
        Squared.make(a_.unit, BigDecimal.multiply(a_.value, b_.value)),
      ),
      Match.orElseAbsurd,
    ),
);

export const unsafeDivide: {
  <U extends BaseUnit.BaseUnit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Quantity.From<U>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Quantity.From<U>;
} = Function.dual(
  2,
  (
    a: Quantity<BaseUnit.BaseUnit>,
    b: BigDecimal.BigDecimal,
  ): Quantity<BaseUnit.BaseUnit> =>
    make(a.unit, BigDecimal.unsafeDivide(a.value, b)),
);

export const divide: {
  <U extends BaseUnit.BaseUnit>(
    b: BigDecimal.BigDecimal,
  ): (a: Quantity<U>) => Option.Option<Quantity.From<U>>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: BigDecimal.BigDecimal,
  ): Option.Option<Quantity.From<U>>;
} = Function.dual(
  2,
  (
    a: Quantity<BaseUnit.BaseUnit>,
    b: BigDecimal.BigDecimal,
  ): Option.Option<Quantity<BaseUnit.BaseUnit>> =>
    BigDecimal.divide(a.value, b).pipe(
      Option.map((value) => make(a.unit, value)),
    ),
);

export const sum: {
  <U extends BaseUnit.BaseUnit>(
    b: Quantity<U>,
  ): (a: Quantity<U>) => Quantity.From<U>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: Quantity<U>,
  ): Quantity.From<U>;
} = Function.dual(
  2,
  (
    a: Quantity<BaseUnit.BaseUnit>,
    b: Quantity<BaseUnit.BaseUnit>,
  ): Quantity<BaseUnit.BaseUnit> =>
    make(a.unit, BigDecimal.sum(a.value, b.value)),
);

export const subtract: {
  <U extends BaseUnit.BaseUnit>(
    b: Quantity<U>,
  ): (a: Quantity<U>) => Quantity.From<U>;
  <U extends BaseUnit.BaseUnit>(
    a: Quantity<U>,
    b: Quantity<U>,
  ): Quantity.From<U>;
} = Function.dual(
  2,
  (
    a: Quantity<BaseUnit.BaseUnit>,
    b: Quantity<BaseUnit.BaseUnit>,
  ): Quantity<BaseUnit.BaseUnit> =>
    make(a.unit, BigDecimal.subtract(a.value, b.value)),
);
