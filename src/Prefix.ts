import * as Function from "effect/Function";
import * as Record from "effect/Record";
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

const base10Exponents: Record<Prefix, number> = {
  Quetta: 30,
  Ronna: 27,
  Yotta: 24,
  Zetta: 21,
  Exa: 18,
  Peta: 15,
  Tera: 12,
  Giga: 9,
  Mega: 6,
  Kilo: 3,
  Hecto: 2,
  Deca: 1,
  Deci: -1,
  Centi: -2,
  Milli: -3,
  Micro: -6,
  Nano: -9,
  Pico: -12,
  Femto: -15,
  Atto: -18,
  Zepto: -21,
  Yocto: -24,
  Ronto: -27,
  Quecto: -30,
};

// Factors come from parsing the decimal form rather than `10 ** exponent`:
// a parsed literal is always the correctly rounded float of the power of
// ten, while the runtime `**` is not (V8 lands one ulp off for 10^-21 and
// 10^-24).
const factors = Record.map(base10Exponents, (exponent) =>
  Number(`1e${exponent}`),
);

export const toBase: {
  (value: number): (prefix: Prefix) => number;
  (prefix: Prefix, value: number): number;
} = Function.dual(
  2,
  (prefix: Prefix, value: number): number => value * factors[prefix],
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
    value / factors[prefix],
);
