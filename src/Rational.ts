import * as BigDecimal from "effect/BigDecimal";
import * as BigInt_ from "effect/BigInt";
import * as Equal from "effect/Equal";
import * as Equivalence_ from "effect/Equivalence";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Option from "effect/Option";
import * as order from "effect/Order";
import type * as Ordering from "effect/Ordering";
import * as ParseResult from "effect/ParseResult";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import { ValueObjectProto } from "./internal/valueObject.ts";

export const TypeId = Symbol.for("effect-units/Rational");
export type TypeId = typeof TypeId;

/**
 * An arbitrary-precision rational number: a reduced fraction of bigints.
 * Unlike floats, arithmetic on rationals is exact — sums, products, and
 * quotients lose no information. Unlike `BigDecimal`, rationals are closed
 * under division (1/3 is a value, not a rounding), which is what makes them
 * the right value type for exact quantities and their rate algebra.
 */
export interface Rational
  extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  readonly [TypeId]: TypeId;
  /** Carries the sign. An integer n is n/1. */
  readonly numerator: bigint;
  /** Always positive; gcd(|numerator|, denominator) is 1. */
  readonly denominator: bigint;
}

export const isRational = (u: unknown): u is Rational =>
  Predicate.hasProperty(u, TypeId);

const Proto = {
  ...ValueObjectProto,
  [TypeId]: TypeId,
  [Equal.symbol](this: Rational, that: unknown): boolean {
    return isRational(that) && equals(this, that);
  },
  [Hash.symbol](this: Rational): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash(this.numerator))(Hash.hash(this.denominator)),
    );
  },
  toJSON(this: Rational) {
    return {
      _id: "Rational",
      numerator: String(this.numerator),
      denominator: String(this.denominator),
    };
  },
} as const;

/** Builds a rational whose fields are already reduced and sign-normalized. */
const ofReduced = (numerator: bigint, denominator: bigint): Rational =>
  Object.assign(Object.create(Proto), { numerator, denominator });

/**
 * Creates the rational `numerator / denominator`, reduced to lowest terms
 * with the sign carried by the numerator. Throws a `RangeError` on a zero
 * denominator — like `Unit.custom`, arguments are expected to be
 * developer-written values, so an invalid one is a defect. For division of
 * runtime values use {@link divide}, which returns an `Option`.
 */
export const make = (numerator: bigint, denominator: bigint = 1n): Rational => {
  if (denominator === 0n) {
    throw new RangeError("Rational.make: zero denominator");
  }
  const flip = denominator < 0n ? -1n : 1n;
  const n = flip * numerator;
  const d = flip * denominator;
  const g = BigInt_.gcd(n < 0n ? -n : n, d);
  return ofReduced(n / g, d / g);
};

export const fromBigInt = (n: bigint): Rational => ofReduced(n, 1n);

export const zero: Rational = fromBigInt(0n);

export const one: Rational = fromBigInt(1n);

// Guards

export const isZero = (r: Rational): boolean => r.numerator === 0n;

export const isInteger = (r: Rational): boolean => r.denominator === 1n;

export const isNegative = (r: Rational): boolean => r.numerator < 0n;

export const isPositive = (r: Rational): boolean => r.numerator > 0n;

// Equality and order

/** Field-wise equality — sound because every rational is stored reduced. */
export const equals: {
  (b: Rational): (a: Rational) => boolean;
  (a: Rational, b: Rational): boolean;
} = Function.dual(
  2,
  (a: Rational, b: Rational): boolean =>
    a.numerator === b.numerator && a.denominator === b.denominator,
);

export const Equivalence: Equivalence_.Equivalence<Rational> =
  Equivalence_.make(equals);

/**
 * Cross-multiplication comparison — denominators are always positive, so no
 * sign flip is needed.
 */
export const Order: order.Order<Rational> = order.make((a, b) => {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;
  return left < right ? -1 : left > right ? 1 : 0;
});

export const lessThan = order.lessThan(Order);

export const lessThanOrEqualTo = order.lessThanOrEqualTo(Order);

export const greaterThan = order.greaterThan(Order);

export const greaterThanOrEqualTo = order.greaterThanOrEqualTo(Order);

export const min = order.min(Order);

export const max = order.max(Order);

export const clamp = order.clamp(Order);

export const between = order.between(Order);

// Arithmetic

export const sum: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational =>
    make(
      a.numerator * b.denominator + b.numerator * a.denominator,
      a.denominator * b.denominator,
    ),
);

export const subtract: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational =>
    make(
      a.numerator * b.denominator - b.numerator * a.denominator,
      a.denominator * b.denominator,
    ),
);

export const multiply: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational =>
    make(a.numerator * b.numerator, a.denominator * b.denominator),
);

export const negate = (r: Rational): Rational =>
  ofReduced(-r.numerator, r.denominator);

export const abs = (r: Rational): Rational =>
  r.numerator < 0n ? negate(r) : r;

export const sign = (r: Rational): Ordering.Ordering =>
  r.numerator < 0n ? -1 : r.numerator > 0n ? 1 : 0;

export const reciprocal = (r: Rational): Option.Option<Rational> =>
  r.numerator === 0n
    ? Option.none()
    : Option.some(
        r.numerator < 0n
          ? ofReduced(-r.denominator, -r.numerator)
          : ofReduced(r.denominator, r.numerator),
      );

/** Throws a `RangeError` when the argument is zero. */
export const unsafeReciprocal = (r: Rational): Rational => {
  if (r.numerator === 0n) {
    throw new RangeError("Division by zero");
  }
  return r.numerator < 0n
    ? ofReduced(-r.denominator, -r.numerator)
    : ofReduced(r.denominator, r.numerator);
};

/** Returns `Option.none()` when the divisor is zero — ℚ has no infinities. */
export const divide: {
  (b: Rational): (a: Rational) => Option.Option<Rational>;
  (a: Rational, b: Rational): Option.Option<Rational>;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Option.Option<Rational> =>
    Option.map(reciprocal(b), (rb) => multiply(a, rb)),
);

/** Throws a `RangeError` when the divisor is zero. */
export const unsafeDivide: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational => multiply(a, unsafeReciprocal(b)),
);

export const sumAll = (collection: Iterable<Rational>): Rational => {
  let acc = zero;
  for (const r of collection) {
    acc = sum(acc, r);
  }
  return acc;
};

export const multiplyAll = (collection: Iterable<Rational>): Rational => {
  let acc = one;
  for (const r of collection) {
    acc = multiply(acc, r);
  }
  return acc;
};

// Rounding

/**
 * Rounds to the nearest bigint under the given mode (the `RoundingMode`
 * vocabulary of `effect/BigDecimal`; the default, `"half-from-zero"`, is
 * BigDecimal's default). Returns a bigint rather than a Rational because
 * every boundary that rounds — money amounts, nanoseconds, milliseconds —
 * wants an integer.
 */
export const round: {
  (options?: {
    readonly mode?: BigDecimal.RoundingMode;
  }): (self: Rational) => bigint;
  (
    self: Rational,
    options?: { readonly mode?: BigDecimal.RoundingMode },
  ): bigint;
} = Function.dual(
  (args) => isRational(args[0]),
  (
    self: Rational,
    options?: { readonly mode?: BigDecimal.RoundingMode },
  ): bigint => {
    const mode = options?.mode ?? "half-from-zero";
    const n = self.numerator;
    const d = self.denominator;
    const quotient = n / d;
    const remainder = n % d;

    if (remainder === 0n) {
      return quotient;
    }

    const towardZero = quotient;
    const fromZero = n < 0n ? quotient - 1n : quotient + 1n;
    const floor = n < 0n ? fromZero : towardZero;
    const ceil = n < 0n ? towardZero : fromZero;
    const twiceRemainder = 2n * (remainder < 0n ? -remainder : remainder);

    switch (mode) {
      case "ceil":
        return ceil;
      case "floor":
        return floor;
      case "to-zero":
        return towardZero;
      case "from-zero":
        return fromZero;
      default: {
        if (twiceRemainder < d) {
          return towardZero;
        }
        if (twiceRemainder > d) {
          return fromZero;
        }
        switch (mode) {
          case "half-ceil":
            return ceil;
          case "half-floor":
            return floor;
          case "half-to-zero":
            return towardZero;
          case "half-from-zero":
            return fromZero;
          case "half-even":
            return towardZero % 2n === 0n ? towardZero : fromZero;
          case "half-odd":
            return towardZero % 2n === 0n ? fromZero : towardZero;
        }
      }
    }
  },
);

// Conversions

/**
 * The exact rational value of a finite double — every finite double is a
 * dyadic rational. Throws a `RangeError` on NaN and ±Infinity.
 */
export const unsafeFromNumber = (n: number): Rational => {
  if (!Number.isFinite(n)) {
    throw new RangeError(`Rational.unsafeFromNumber: ${n}`);
  }
  // Doubling a finite non-integral double is always exact (its magnitude is
  // below 2^53), so this loop terminates with the exact scaled mantissa.
  let mantissa = n;
  let denominator = 1n;
  while (!Number.isInteger(mantissa)) {
    mantissa *= 2;
    denominator <<= 1n;
  }
  return make(BigInt(mantissa), denominator);
};

export const fromNumber = (n: number): Option.Option<Rational> =>
  Number.isFinite(n) ? Option.some(unsafeFromNumber(n)) : Option.none();

const maxSafeInteger = 9007199254740991n;

const bitLength = (n: bigint): number => n.toString(2).length;

/**
 * The correctly rounded (nearest, ties to even) double of a positive
 * rational a/b, or `undefined` on overflow to Infinity. Guard/round/sticky
 * rounding on a ≥55-bit integer quotient, with subnormal precision loss and
 * carry handled explicitly.
 */
const positiveToNumber = (a: bigint, b: bigint): number | undefined => {
  // Both operands exactly representable: one correctly rounded division.
  if (a <= maxSafeInteger && b <= maxSafeInteger) {
    return Number(a) / Number(b);
  }

  // a/b lies in [2^(e-1), 2^(e+1)).
  const e = bitLength(a) - bitLength(b);
  // Below 2^-1075 (the midpoint between 0 and the smallest subnormal)
  // everything rounds to 0; at or above 2^1024 everything overflows.
  if (e <= -1076) {
    return 0;
  }
  if (e >= 1025) {
    return undefined;
  }

  // Scale so the integer quotient has at least 55 bits.
  const shift = 55 - e;
  const scaledA = shift >= 0 ? a << BigInt(shift) : a;
  const scaledB = shift >= 0 ? b : b << BigInt(-shift);
  const quotient = scaledA / scaledB;
  const remainder = scaledA % scaledB;

  // The value's leading bit sits at exactly this power of two.
  const quotientBits = bitLength(quotient);
  const leadPosition = quotientBits - 1 - shift;
  if (leadPosition > 1023) {
    return undefined;
  }
  if (leadPosition < -1075) {
    return 0;
  }
  if (leadPosition === -1075) {
    // Candidates are 0 and 2^-1074, with the midpoint at 2^-1075: exactly
    // the midpoint ties to even (0), anything above rounds up.
    const isExactMidpoint =
      quotient === 1n << BigInt(quotientBits - 1) && remainder === 0n;
    return isExactMidpoint ? 0 : 2 ** -1074;
  }

  // Subnormal results keep fewer than 53 bits (the lowest kept bit is 2^-1074).
  const precision = Math.min(53, leadPosition + 1075);
  const drop = quotientBits - precision;
  let mantissa = quotient >> BigInt(drop);
  const roundBit = (quotient >> BigInt(drop - 1)) & 1n;
  const sticky =
    (quotient & ((1n << BigInt(drop - 1)) - 1n)) !== 0n || remainder !== 0n;
  if (roundBit === 1n && (sticky || mantissa % 2n === 1n)) {
    mantissa += 1n;
  }

  // A carry out of the mantissa (to exactly 2^precision) raises the leading
  // bit by one, which can push a near-maximal value over the top.
  const carried = bitLength(mantissa) > precision;
  if (leadPosition + (carried ? 1 : 0) > 1023) {
    return undefined;
  }

  // Both factors are exact and the product is representable by construction,
  // so this multiplication is exact (2^exponent is exact for exponent ≥ -1074).
  return Number(mantissa) * 2 ** (drop - shift);
};

/**
 * The correctly rounded double nearest the rational, or `Option.none()`
 * when that double would be ±Infinity. Underflow to zero is a rounding, not
 * a failure, and yields `Option.some(0)`.
 */
export const toNumber = (r: Rational): Option.Option<number> => {
  if (r.numerator === 0n) {
    return Option.some(0);
  }
  const negative = r.numerator < 0n;
  const magnitude = positiveToNumber(
    negative ? -r.numerator : r.numerator,
    r.denominator,
  );
  return magnitude === undefined
    ? Option.none()
    : Option.some(negative ? -magnitude : magnitude);
};

/** Throws a `RangeError` when the nearest double is ±Infinity. */
export const unsafeToNumber = (r: Rational): number =>
  Option.getOrThrowWith(
    toNumber(r),
    () => new RangeError(`Rational.unsafeToNumber: ${format(r)} overflows`),
  );

export const fromBigDecimal = (bd: BigDecimal.BigDecimal): Rational =>
  bd.scale >= 0
    ? make(bd.value, 10n ** BigInt(bd.scale))
    : make(bd.value * 10n ** BigInt(-bd.scale));

/**
 * Rounds to a `BigDecimal` at the given scale — exactly one rounding, made
 * explicit. For a lossless conversion when one exists, use
 * {@link toBigDecimalExact}.
 */
export const toBigDecimal: {
  (options: {
    readonly scale: number;
    readonly mode?: BigDecimal.RoundingMode;
  }): (self: Rational) => BigDecimal.BigDecimal;
  (
    self: Rational,
    options: {
      readonly scale: number;
      readonly mode?: BigDecimal.RoundingMode;
    },
  ): BigDecimal.BigDecimal;
} = Function.dual(
  2,
  (
    self: Rational,
    options: {
      readonly scale: number;
      readonly mode?: BigDecimal.RoundingMode;
    },
  ): BigDecimal.BigDecimal => {
    const scaled =
      options.scale >= 0
        ? make(self.numerator * 10n ** BigInt(options.scale), self.denominator)
        : make(
            self.numerator,
            self.denominator * 10n ** BigInt(-options.scale),
          );
    return BigDecimal.make(
      round(scaled, options.mode === undefined ? {} : { mode: options.mode }),
      options.scale,
    );
  },
);

/**
 * The exact `BigDecimal` equal to the rational, when one exists — i.e. when
 * the denominator is a product of twos and fives, so the decimal expansion
 * terminates. `Option.none()` otherwise (e.g. 1/3).
 */
export const toBigDecimalExact = (
  self: Rational,
): Option.Option<BigDecimal.BigDecimal> => {
  let d = self.denominator;
  let twos = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    twos += 1;
  }
  let fives = 0;
  while (d % 5n === 0n) {
    d /= 5n;
    fives += 1;
  }
  if (d !== 1n) {
    return Option.none();
  }
  const scale = twos > fives ? twos : fives;
  return Option.some(
    BigDecimal.make(
      (self.numerator * 10n ** BigInt(scale)) / self.denominator,
      scale,
    ),
  );
};

// Formatting and schemas

/**
 * The canonical string encoding: the reduced fraction with the sign on the
 * numerator, integers without the `/1` (`"3/2"`, `"-3/2"`, `"3"`).
 */
export const format = (r: Rational): string =>
  r.denominator === 1n
    ? String(r.numerator)
    : `${r.numerator}/${r.denominator}`;

const parsePattern = /^(-?\d+)(?:\/([1-9]\d*))?$/;

/**
 * Parses the encoding produced by {@link format} (a denominator of 1 may be
 * spelled out; non-canonical fractions like `"6/4"` reduce on the way in).
 * Returns `Option.none()` for anything else, including zero denominators.
 */
export const fromString = (s: string): Option.Option<Rational> => {
  const match = parsePattern.exec(s);
  if (match === null || match[1] === undefined) {
    return Option.none();
  }
  return Option.some(
    make(BigInt(match[1]), match[2] === undefined ? 1n : BigInt(match[2])),
  );
};

/** Throws a `RangeError` on input {@link fromString} would reject. */
export const unsafeFromString = (s: string): Rational =>
  Option.getOrThrowWith(
    fromString(s),
    () => new RangeError(`Rational.unsafeFromString: ${JSON.stringify(s)}`),
  );

export const RationalFromSelf = Schema.declare(isRational, {
  identifier: "RationalFromSelf",
  pretty: () => format,
  arbitrary: () => (fc) =>
    fc
      .tuple(fc.bigInt(), fc.bigInt({ min: 1n }))
      .map(([numerator, denominator]) => make(numerator, denominator)),
  equivalence: () => Equivalence,
});

export const Rational = Schema.transformOrFail(
  Schema.String.annotations({
    description: "a string to be decoded into a Rational",
  }),
  RationalFromSelf,
  {
    strict: true,
    decode: (s, _options, ast) =>
      Option.match(fromString(s), {
        onNone: () =>
          ParseResult.fail(
            new ParseResult.Type(ast, s, "not a canonical rational encoding"),
          ),
        onSome: (r) => ParseResult.succeed(r),
      }),
    encode: (r) => ParseResult.succeed(format(r)),
  },
).annotations({ identifier: "Rational" });
