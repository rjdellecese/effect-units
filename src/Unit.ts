import * as Equal from "effect/Equal";
import { pipe } from "effect/Function";
import * as Hash from "effect/Hash";
import * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as String from "effect/String";

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

export interface Product<in out U1 extends Unit, in out U2 extends Unit>
  extends Equal.Equal, Inspectable.Inspectable {
  readonly _tag: "Product";
  readonly left: U1;
  readonly right: U2;
}

export interface Rate<
  in out Dependent extends Unit,
  in out Independent extends Unit,
> extends Equal.Equal, Inspectable.Inspectable {
  readonly _tag: "Rate";
  readonly dependent: Dependent;
  readonly independent: Independent;
}

export type Unit = BaseUnit | Product<Unit, Unit> | Rate<Unit, Unit>;

export type Squared<U extends Unit> = Product<U, U>;

export type Cubed<U extends Unit> = Product<Product<U, U>, U>;

// Composite units implement Equal, Hash, and Inspectable (base units are
// bare strings, which support all three natively). Inspection shows the
// canonical encoding.

const Proto = {
  [Equal.symbol](this: Unit, that: unknown): boolean {
    return isUnit(that) && equals(this, that);
  },
  [Hash.symbol](this: Unit): number {
    return Hash.string(encode(this));
  },
  toJSON(this: Unit): string {
    return encode(this);
  },
  toString(this: Unit): string {
    return encode(this);
  },
  [Inspectable.NodeInspectSymbol](this: Unit): string {
    return encode(this);
  },
} as const;

export const product = <U1 extends Unit, U2 extends Unit>(
  left: U1,
  right: U2,
): Product<U1, U2> =>
  Object.assign(Object.create(Proto), { _tag: "Product", left, right });

export const rate = <Dependent extends Unit, Independent extends Unit>(
  dependent: Dependent,
  independent: Independent,
): Rate<Dependent, Independent> =>
  Object.assign(Object.create(Proto), { _tag: "Rate", dependent, independent });

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
 * a `Quantity`'s encoded form and feeds unit hashing. It doubles as the
 * inspection output for composite units, whose `Inspectable` implementation
 * delegates to it.
 */
export const encode = (u: Unit): string =>
  typeof u === "string"
    ? u
    : u._tag === "Product"
      ? `(${encode(u.left)}*${encode(u.right)})`
      : `(${encode(u.dependent)}/${encode(u.independent)})`;

// A parse step consumes a prefix of the input, yielding the parsed unit and
// the remaining input.
type Parsed = readonly [unit: Unit, rest: string];

const parseBaseUnit = (input: string): Option.Option<Parsed> =>
  pipe(
    String.match(/^[A-Za-z]+/)(input),
    Option.flatMap((matches) => Option.fromNullable(matches[0])),
    Option.filter(Schema.is(BaseUnit)),
    Option.map((name) => [name, String.slice(name.length)(input)] as const),
  );

const parseComposite = (input: string): Option.Option<Parsed> =>
  pipe(
    parseTree(String.slice(1)(input)),
    Option.flatMap(([first, afterFirst]) =>
      pipe(
        String.charAt(0)(afterFirst),
        Option.filter(
          (operator): operator is "*" | "/" =>
            operator === "*" || operator === "/",
        ),
        Option.flatMap((operator) =>
          pipe(
            parseTree(String.slice(1)(afterFirst)),
            Option.flatMap(([second, afterSecond]) =>
              String.startsWith(")")(afterSecond)
                ? Option.some([
                    operator === "*"
                      ? product(first, second)
                      : rate(first, second),
                    String.slice(1)(afterSecond),
                  ] as const)
                : Option.none(),
            ),
          ),
        ),
      ),
    ),
  );

const parseTree = (input: string): Option.Option<Parsed> =>
  String.startsWith("(")(input) ? parseComposite(input) : parseBaseUnit(input);

/**
 * Parses the canonical encoding produced by {@link encode}. Returns
 * `Option.none()` for anything else.
 */
export const decode = (input: string): Option.Option<Unit> =>
  parseTree(input).pipe(
    Option.flatMap(([unit, rest]) =>
      rest === "" ? Option.some(unit) : Option.none(),
    ),
  );

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
