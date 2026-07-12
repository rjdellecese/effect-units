import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

export const Prefix = Schema.Literal(
  "Quetta",
  "Ronna",
  "Yotta",
  "Zetta",
  "Exa",
  "Peta",
  "Tera",
  "Giga",
  "Mega",
  "Kilo",
  "Hecto",
  "Deca",
  "Deci",
  "Centi",
  "Milli",
  "Micro",
  "Nano",
  "Pico",
  "Femto",
  "Atto",
  "Zepto",
  "Yocto",
  "Ronto",
  "Quecto",
);

export type Prefix = typeof Prefix.Type;

const base10Exponent = (prefix: Prefix) =>
  Match.value(prefix).pipe(
    (matcher) =>
      matcher.pipe(
        Match.when("Quetta", () => 30),
        Match.when("Ronna", () => 27),
        Match.when("Yotta", () => 24),
        Match.when("Zetta", () => 21),
        Match.when("Exa", () => 18),
        Match.when("Peta", () => 15),
        Match.when("Tera", () => 12),
        Match.when("Giga", () => 9),
        Match.when("Mega", () => 6),
        Match.when("Kilo", () => 3),
        Match.when("Hecto", () => 2),
        Match.when("Deca", () => 1),
      ),
    (matcher) =>
      matcher.pipe(
        Match.when("Deci", () => -1),
        Match.when("Centi", () => -2),
        Match.when("Milli", () => -3),
        Match.when("Micro", () => -6),
        Match.when("Nano", () => -9),
        Match.when("Pico", () => -12),
        Match.when("Femto", () => -15),
        Match.when("Atto", () => -18),
        Match.when("Zepto", () => -21),
        Match.when("Yocto", () => -24),
        Match.when("Ronto", () => -27),
        Match.when("Quecto", () => -30),
      ),
    Match.exhaustive,
  );

export const toBase: {
  (value: number): (prefix: Prefix) => number;
  (prefix: Prefix, value: number): number;
} = Function.dual(
  2,
  (prefix: Prefix, value: number): number =>
    value * 10 ** base10Exponent(prefix),
);

export const toPrefixed: {
  (value: number): (prefix: Prefix) => number;
  (prefix: Prefix, value: number): number;
} = Function.dual(
  2,
  (prefix: Prefix, value: number): number =>
    // Dividing by the same factor toBase multiplies by, rather than
    // multiplying by its inverse, keeps roundtrips as close to exact as
    // floats allow.
    value / 10 ** base10Exponent(prefix),
);
