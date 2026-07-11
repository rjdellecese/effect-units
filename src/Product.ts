import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import * as BaseUnit from "./BaseUnit";

export const TypeId = Symbol.for("effect-units/Product");
export type TypeId = typeof TypeId;

export const Product = <
  U1 extends BaseUnit.BaseUnit,
  U2 extends BaseUnit.BaseUnit,
>(
  unit1: U1,
  unit2: U2,
) =>
  Schema.declare((u: unknown): u is Product<U1, U2> =>
    isProduct(unit1, unit2)(u),
  );

export interface Product<
  U1 extends BaseUnit.BaseUnit,
  U2 extends BaseUnit.BaseUnit,
>
  extends Equal.Equal {
  readonly [TypeId]: TypeId;
  readonly unit1: U1;
  readonly unit2: U2;
  readonly value: BigDecimal.BigDecimal;
}

export const isProduct =
  <U1 extends BaseUnit.BaseUnit, U2 extends BaseUnit.BaseUnit>(
    u1?: U1,
    u2?: U2,
  ) =>
  (u: unknown): u is Product<U1, U2> =>
    Predicate.hasProperty(u, TypeId) &&
    (u1 ? Predicate.hasProperty(u, "unit1") && u.unit1 === u1 : true) &&
    (u2 ? Predicate.hasProperty(u, "unit2") && u.unit2 === u2 : true);

const ProductProto = {
  [TypeId]: TypeId,
  [Equal.symbol](
    this: Product<BaseUnit.BaseUnit, BaseUnit.BaseUnit>,
    that: unknown,
  ): boolean {
    return isProduct()(that) && equals(this, that);
  },
  [Hash.symbol](this: Product<BaseUnit.BaseUnit, BaseUnit.BaseUnit>): number {
    return Hash.hash(this.value);
  },
} as const;

export const make = <
  U1 extends BaseUnit.BaseUnit,
  U2 extends BaseUnit.BaseUnit,
>(
  unit1: U1,
  unit2: U2,
  value: BigDecimal.BigDecimal,
): Product<U1, U2> =>
  Object.assign(Object.create(ProductProto), { unit1, unit2, value });

export const equals = <
  U1 extends BaseUnit.BaseUnit,
  U2 extends BaseUnit.BaseUnit,
>(
  a: Product<U1, U2>,
  b: Product<U1, U2>,
): boolean =>
  Equal.equals(a.value, b.value) &&
  Equal.equals(a.unit1, b.unit1) &&
  Equal.equals(a.unit2, b.unit2);
