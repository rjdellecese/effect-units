/**
 * Exact rational counterparts of the SI-prefix factors in ../Prefix.ts.
 * Every prefix is a power of ten, so prefix math is exact in ℚ—unlike the
 * float side, dividing by the factor and multiplying by its reciprocal are
 * the same operation here.
 *
 * The exponent table is duplicated from ../Prefix.ts (where it is private);
 * test/ConstantsExact.test.ts asserts the two agree for every prefix.
 *
 * @module
 */
import * as Record from "effect/Record";

import type * as Prefix from "../Prefix.ts";
import * as Rational from "../Rational.ts";

const base10Exponents: Record<Prefix.Prefix, number> = {
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

const factorOf = (exponent: number): Rational.Rational =>
  exponent >= 0
    ? Rational.makeUnsafe(10n ** BigInt(exponent))
    : Rational.makeUnsafe(1n, 10n ** BigInt(-exponent));

export const factors = Record.map(base10Exponents, factorOf);

const inverseFactors = Record.map(factors, Rational.reciprocalUnsafe);

export const toBase = (
  prefix: Prefix.Prefix,
  value: Rational.Rational,
): Rational.Rational => Rational.multiply(value, factors[prefix]);

export const toPrefixed = (
  prefix: Prefix.Prefix,
  value: Rational.Rational,
): Rational.Rational => Rational.multiply(value, inverseFactors[prefix]);
