import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import { pipe } from "effect/Function";
import * as Hash from "effect/Hash";
import * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as SchemaGetter from "effect/SchemaGetter";
import * as SchemaIssue from "effect/SchemaIssue";
import * as String from "effect/String";

/**
 * The leaf tags of the unit algebra—every other unit is a `Product` or
 * `Rate` composition of these.
 */
export const BaseUnit = Schema.Literals([
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
]);

export type BaseUnit = typeof BaseUnit.Type;

const isBaseUnit = Schema.is(BaseUnit);

export interface Product<in out U1 extends Unit, in out U2 extends Unit>
  extends Equal.Equal, Inspectable.Inspectable {
  readonly _tag: "Product";
  readonly left: U1;
  readonly right: U2;
}

export interface Rate<
  in out Dependent extends Unit,
  in out Independent extends Unit,
>
  extends Equal.Equal, Inspectable.Inspectable {
  readonly _tag: "Rate";
  readonly dependent: Dependent;
  readonly independent: Independent;
}

/**
 * A user-defined base unit, identified by `Id`. Custom units are leaves of
 * the unit tree, just like {@link BaseUnit}, and compose freely with
 * `Product` and `Rate`.
 */
export interface Custom<in out Id extends string>
  extends Equal.Equal, Inspectable.Inspectable {
  readonly _tag: "Custom";
  readonly id: Id;
}

export type Unit =
  | BaseUnit
  | Custom<string>
  | Product<Unit, Unit>
  | Rate<Unit, Unit>;

export type Squared<U extends Unit> = Product<U, U>;

export type Cubed<U extends Unit> = Product<Product<U, U>, U>;

// Composite units implement Equal, Hash, and Inspectable (base units are
// bare strings, which support all three natively). Inspection shows the
// canonical encoding.

const Proto = {
  [Equal.symbol](this: Unit, that: unknown): boolean {
    return isUnit(that) && equals(this, that);
  },
  [Hash.symbol](this: Unit & object): number {
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

const validCustomId = /^[A-Za-z][A-Za-z0-9]*$/;

/**
 * Creates a {@link Custom} base unit. The id must match
 * `/^[A-Za-z][A-Za-z0-9]*$/`—the charset keeps ids trivially safe inside
 * the canonical encoding's grammar. Ids are expected to be developer-written
 * literals, so an invalid id throws (a defect, not a recoverable error).
 *
 * A custom unit is always distinct from a {@link BaseUnit} with the same
 * name: `Unit.custom("Meters")` encodes as `"[Meters]"` and never equals
 * `"Meters"`.
 */
export const custom = <Id extends string>(id: Id): Custom<Id> => {
  if (!validCustomId.test(id)) {
    throw new Error(
      `Unit.custom: invalid id ${JSON.stringify(id)} (expected /^[A-Za-z][A-Za-z0-9]*$/)`,
    );
  }
  return Object.assign(Object.create(Proto), { _tag: "Custom", id });
};

export const squared = <U extends Unit>(unit: U): Squared<U> =>
  product(unit, unit);

export const cubed = <U extends Unit>(unit: U): Cubed<U> =>
  product(product(unit, unit), unit);

export const isUnit = (u: unknown): u is Unit =>
  typeof u === "string"
    ? isBaseUnit(u)
    : Predicate.isReadonlyObject(u) &&
      (u._tag === "Product"
        ? isUnit(u.left) && isUnit(u.right)
        : u._tag === "Rate"
          ? isUnit(u.dependent) && isUnit(u.independent)
          : u._tag === "Custom" &&
            Predicate.isString(u.id) &&
            validCustomId.test(u.id));

export const equals = (a: Unit, b: Unit): boolean =>
  typeof a === "string" || typeof b === "string"
    ? a === b
    : a._tag === "Custom" || b._tag === "Custom"
      ? a._tag === "Custom" && b._tag === "Custom" && a.id === b.id
      : a._tag === "Product" && b._tag === "Product"
        ? equals(a.left, b.left) && equals(a.right, b.right)
        : a._tag === "Rate" &&
          b._tag === "Rate" &&
          equals(a.dependent, b.dependent) &&
          equals(a.independent, b.independent);

/**
 * The canonical string encoding of a unit tree, e.g. `"Meters"`, `"[USD]"`
 * (a custom unit), `"(Meters/Seconds)"`, or
 * `"(Kilograms*((Meters/Seconds)/Seconds))"`.
 *
 * This is a stable serialization format—it appears as the `unit` field of
 * a `Quantity`'s encoded form and feeds unit hashing. It doubles as the
 * inspection output for composite units, whose `Inspectable` implementation
 * delegates to it.
 */
export const encode = (u: Unit): string =>
  typeof u === "string"
    ? u
    : u._tag === "Custom"
      ? `[${u.id}]`
      : u._tag === "Product"
        ? `(${encode(u.left)}*${encode(u.right)})`
        : `(${encode(u.dependent)}/${encode(u.independent)})`;

// A parse step consumes a prefix of the input, yielding the parsed unit and
// the remaining input.
type Parsed = readonly [unit: Unit, rest: string];

const baseUnitName = /^[A-Za-z]+/;

// Far deeper than any legitimate unit tree; bounds recursion so adversarial
// input fails with Option.none() instead of a stack overflow.
const maxDepth = 64;

const parseBaseUnit = (input: string): Option.Option<Parsed> =>
  pipe(
    String.match(baseUnitName)(input),
    Option.flatMap((matches) => Option.fromUndefinedOr(matches[0])),
    Option.filter(isBaseUnit),
    Option.map((name) => [name, String.slice(name.length)(input)] as const),
  );

const customUnit = /^\[[A-Za-z][A-Za-z0-9]*\]/;

const parseCustom = (input: string): Option.Option<Parsed> =>
  pipe(
    String.match(customUnit)(input),
    Option.flatMap((matches) => Option.fromUndefinedOr(matches[0])),
    Option.map(
      (matched) =>
        [
          custom(matched.slice(1, -1)),
          String.slice(matched.length)(input),
        ] as const,
    ),
  );

const parseComposite = (input: string, depth: number): Option.Option<Parsed> =>
  Option.gen(function* () {
    const [first, afterFirst] = yield* parseTree(String.slice(1)(input), depth);
    const operator = yield* pipe(
      String.charAt(0)(afterFirst),
      Option.filter(
        (character): character is "*" | "/" =>
          character === "*" || character === "/",
      ),
    );
    const [second, afterSecond] = yield* parseTree(
      String.slice(1)(afterFirst),
      depth,
    );

    if (!String.startsWith(")")(afterSecond)) {
      return yield* Option.none();
    }

    return [
      operator === "*" ? product(first, second) : rate(first, second),
      String.slice(1)(afterSecond),
    ] as const;
  });

const parseTree = (input: string, depth: number): Option.Option<Parsed> =>
  depth > maxDepth
    ? Option.none()
    : String.startsWith("(")(input)
      ? parseComposite(input, depth + 1)
      : String.startsWith("[")(input)
        ? parseCustom(input)
        : parseBaseUnit(input);

/**
 * Parses the canonical encoding produced by {@link encode}. Returns
 * `Option.none()` for anything else, including trees nested beyond any
 * depth the library's unit algebra can produce.
 */
export const decode = (input: string): Option.Option<Unit> =>
  parseTree(input, 0).pipe(
    Option.flatMap(([unit, rest]) =>
      rest === "" ? Option.some(unit) : Option.none(),
    ),
  );

/**
 * The single definition of the canonical string encoding, shared by
 * {@link UnitFromString} and by the `toCodecJson` annotation on
 * {@link Unit}, so the two can never drift apart.
 */
const stringTransformation = {
  decode: SchemaGetter.transformOrFail((input: string) =>
    Option.match(decode(input), {
      onNone: () =>
        Effect.fail(
          new SchemaIssue.InvalidValue(Option.some(input), {
            message: "not a canonical unit encoding",
          }),
        ),
      onSome: Effect.succeed,
    }),
  ),
  encode: SchemaGetter.transform(encode),
};

/**
 * The identity schema: a `Unit` on both sides, decoded from itself.
 *
 * It carries the canonical string encoding as its JSON representation, so
 * `Schema.toCodecJson` derives that codec on demand—including when a unit
 * is nested inside a larger schema of your own. {@link UnitFromString} is
 * the same codec named directly, with a precise `string` encoded type
 * rather than `Json`.
 */
export const Unit = Schema.declare(isUnit, {
  identifier: "Unit",
  description: "a unit tree",
  toCodecJson: () => Schema.link<Unit>()(Schema.String, stringTransformation),
});

export const UnitFromString = Schema.String.pipe(
  Schema.decodeTo(Unit, stringTransformation),
).annotate({ identifier: "UnitFromString" });
