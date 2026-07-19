/**
 * Shared machinery for the library's float-backed value objects (`Quantity`
 * and `Temperature`), so their equality, normalization, and inspection
 * semantics are defined in exactly one place.
 *
 * @module
 */
import * as Inspectable from "effect/Inspectable";
import * as Pipeable from "effect/Pipeable";

/**
 * Float equality with NaN equal to itself, so `Equal.equals` stays
 * reflexive.
 */
export const valueEquals = (a: number, b: number): boolean =>
  a === b || (Number.isNaN(a) && Number.isNaN(b));

/**
 * Normalizes -0 to 0 so the two float zeros are one value for equality and
 * hashing.
 */
export const normalizeZero = (value: number): number =>
  value === 0 ? 0 : value;

/**
 * Prototype fragment providing `Inspectable`'s derived members (in terms of
 * the host's `toJSON`) and `Pipeable`.
 */
export const ValueObjectProto = {
  toString(this: Inspectable.Inspectable): string {
    return Inspectable.format(this.toJSON());
  },
  [Inspectable.NodeInspectSymbol](this: Inspectable.Inspectable) {
    return this.toJSON();
  },
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
} as const;
