import * as Data from "effect/Data";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

/**
 * The leaf tags of the unit algebra — every other unit is a `Product` or
 * `Rate` composition of these.
 *
 * The set is ported from `elm-units` and is deliberately *not* the SI base
 * set: it is the set of leaves that makes the library's compositions
 * expressible while keeping unit trees shallow, not a physically minimal
 * basis. Notable divergences from SI: charge (`Coulombs`) is the base tag
 * and current is derived as `Rate<Coulombs, Seconds>` (SI does the
 * reverse); the candela — an SI base unit — is derived here as
 * `Rate<Lumens, Steradians>`; `Farads` and `Henries` are kept opaque, as in
 * `elm-units`, even though decompositions via volts exist; `Radians` and
 * `Steradians` (dimensionless in SI), `Pixels` (screen space), and
 * `CelsiusDegrees` (temperature deltas) are pragmatic additions; and
 * kelvins are absent because absolute temperature is not a `Quantity` (see
 * `Temperature`).
 */
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

export interface Product<in out U1 extends Unit, in out U2 extends Unit> {
  readonly _tag: "Product";
  readonly left: U1;
  readonly right: U2;
}

export interface Rate<
  in out Dependent extends Unit,
  in out Independent extends Unit,
> {
  readonly _tag: "Rate";
  readonly dependent: Dependent;
  readonly independent: Independent;
}

export type Unit = BaseUnit | Product<Unit, Unit> | Rate<Unit, Unit>;

export type Squared<U extends Unit> = Product<U, U>;

export type Cubed<U extends Unit> = Product<Product<U, U>, U>;

// Composite units are built with Data.struct, so units support Equal.equals
// and Hash out of the box (base units are plain strings, which already do).

export const product = <U1 extends Unit, U2 extends Unit>(
  left: U1,
  right: U2,
): Product<U1, U2> => Data.struct({ _tag: "Product" as const, left, right });

export const rate = <Dependent extends Unit, Independent extends Unit>(
  dependent: Dependent,
  independent: Independent,
): Rate<Dependent, Independent> =>
  Data.struct({ _tag: "Rate" as const, dependent, independent });

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
 * The canonical string encoding of a unit tree, e.g. `"Meters"`,
 * `"(Meters/Seconds)"`, or `"(Kilograms*((Meters/Seconds)/Seconds))"`.
 *
 * This is a stable serialization format — it appears as the `unit` field of
 * a `Quantity`'s encoded form and feeds unit hashing — not a display format.
 * For human-facing output, `Quantity` implements `Inspectable`
 * (`toString`/`toJSON`).
 */
export const encode = (u: Unit): string =>
  typeof u === "string"
    ? u
    : u._tag === "Product"
      ? `(${encode(u.left)}*${encode(u.right)})`
      : `(${encode(u.dependent)}/${encode(u.independent)})`;

/**
 * Parses the canonical encoding produced by {@link encode}. Returns
 * `Option.none()` for anything else.
 */
export const decode = (input: string): Option.Option<Unit> => {
  let index = 0;

  const parseTree = (): Unit | undefined => {
    if (input[index] === "(") {
      index++;
      const first = parseTree();
      if (first === undefined) {
        return undefined;
      }
      const operator = input[index];
      if (operator !== "*" && operator !== "/") {
        return undefined;
      }
      index++;
      const second = parseTree();
      if (second === undefined || input[index] !== ")") {
        return undefined;
      }
      index++;

      return operator === "*" ? product(first, second) : rate(first, second);
    }

    const start = index;
    while (index < input.length && /[A-Za-z]/.test(input.charAt(index))) {
      index++;
    }
    const name = input.slice(start, index);

    return Schema.is(BaseUnit)(name) ? name : undefined;
  };

  const result = parseTree();

  return result !== undefined && index === input.length
    ? Option.some(result)
    : Option.none();
};

export const UnitFromSelf = Schema.declare(isUnit).annotations({
  identifier: "UnitFromSelf",
  description: "a unit tree",
});

export const Unit = Schema.transformOrFail(Schema.String, UnitFromSelf, {
  strict: true,
  decode: (input, _options, ast) =>
    Option.match(decode(input), {
      onNone: () =>
        ParseResult.fail(
          new ParseResult.Type(ast, input, "not a canonical unit encoding"),
        ),
      onSome: (unit) => ParseResult.succeed(unit),
    }),
  encode: (unit) => ParseResult.succeed(encode(unit)),
}).annotations({ identifier: "Unit" });
