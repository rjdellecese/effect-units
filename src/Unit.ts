import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

export const BaseUnit = Schema.Literal(
  "Meters",
  "Seconds",
  "Kilograms",
  "Radians",
  "Pixels",
  "Coulombs",
  "Farads",
  "Henries",
  "Lumens",
  "Moles",
  "Steradians",
  "CelsiusDegrees",
);

export type BaseUnit = typeof BaseUnit.Type;

export interface Product<in out A extends Unit, in out B extends Unit> {
  readonly _tag: "Product";
  readonly left: A;
  readonly right: B;
}

export interface Rate<in out Dep extends Unit, in out Indep extends Unit> {
  readonly _tag: "Rate";
  readonly dependent: Dep;
  readonly independent: Indep;
}

export type Unit = BaseUnit | Product<Unit, Unit> | Rate<Unit, Unit>;

export type Squared<U extends Unit> = Product<U, U>;

export type Cubed<U extends Unit> = Product<Product<U, U>, U>;

export const product = <A extends Unit, B extends Unit>(
  left: A,
  right: B,
): Product<A, B> => ({ _tag: "Product", left, right });

export const rate = <Dep extends Unit, Indep extends Unit>(
  dependent: Dep,
  independent: Indep,
): Rate<Dep, Indep> => ({ _tag: "Rate", dependent, independent });

export const squared = <U extends Unit>(unit: U): Squared<U> =>
  product(unit, unit);

export const cubed = <U extends Unit>(unit: U): Cubed<U> =>
  product(product(unit, unit), unit);

export const isUnit = (u: unknown): u is Unit =>
  typeof u === "string"
    ? Schema.is(BaseUnit)(u)
    : Predicate.isRecord(u) &&
      (u._tag === "Product"
        ? isUnit(u.left) && isUnit(u.right)
        : u._tag === "Rate" && isUnit(u.dependent) && isUnit(u.independent));

export const equals = (a: Unit, b: Unit): boolean =>
  typeof a === "string" || typeof b === "string"
    ? a === b
    : a._tag === "Product" && b._tag === "Product"
      ? equals(a.left, b.left) && equals(a.right, b.right)
      : a._tag === "Rate" &&
        b._tag === "Rate" &&
        equals(a.dependent, b.dependent) &&
        equals(a.independent, b.independent);

/**
 * Canonical rendering of a unit tree, e.g. `"Meters"`, `"(Meters/Seconds)"`,
 * or `"(Kilograms*((Meters/Seconds)/Seconds))"`. Used as the `unit` field of
 * the
 * serialized form of a `Quantity`.
 */
export const print = (u: Unit): string =>
  typeof u === "string"
    ? u
    : u._tag === "Product"
      ? `(${print(u.left)}*${print(u.right)})`
      : `(${print(u.dependent)}/${print(u.independent)})`;
