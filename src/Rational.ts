import * as Array from "effect/Array";
import * as BigDecimal from "effect/BigDecimal";
import * as BigInt from "effect/BigInt";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Equivalence_ from "effect/Equivalence";
import * as Function from "effect/Function";
import * as Hash from "effect/Hash";
import type * as Inspectable from "effect/Inspectable";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as order from "effect/Order";
import type * as Ordering from "effect/Ordering";
import type * as Pipeable from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as SchemaGetter from "effect/SchemaGetter";
import * as SchemaIssue from "effect/SchemaIssue";
import * as String from "effect/String";

import { ValueObjectProto } from "./internal/valueObject.ts";

export const TypeId = Symbol.for("effect-units/Rational");
export type TypeId = typeof TypeId;

/**
 * An arbitrary-precision rational number: a reduced fraction of bigints.
 * Unlike floats, arithmetic on rationals is exact—sums, products, and
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
    return Hash.combine(Hash.hash(this.numerator))(Hash.hash(this.denominator));
  },
  toJSON(this: Rational) {
    return {
      _id: "Rational",
      numerator: globalThis.String(this.numerator),
      denominator: globalThis.String(this.denominator),
    };
  },
} as const;

/** Builds a rational whose fields are already reduced and sign-normalized. */
const ofReduced = (numerator: bigint, denominator: bigint): Rational =>
  Object.assign(Object.create(Proto), { numerator, denominator });

/**
 * Reduces a fraction to lowest terms with the sign carried by the
 * numerator. Total on a non-zero denominator, which every caller
 * establishes first—internal arithmetic derives denominators as products
 * of positive denominators, so they are never zero.
 */
const reduce = (numerator: bigint, denominator: bigint): Rational => {
  const flip = denominator < 0n ? -1n : 1n;
  const n = flip * numerator;
  const d = flip * denominator;
  const g = BigInt.gcd(n < 0n ? -n : n, d);
  return ofReduced(n / g, d / g);
};

/**
 * Creates the rational `numerator / denominator`, reduced to lowest terms
 * with the sign carried by the numerator. Returns `Option.none()` on a zero
 * denominator; {@link makeUnsafe} is the throwing counterpart for
 * developer-written literals.
 */
export const make = (
  numerator: bigint,
  denominator: bigint = 1n,
): Option.Option<Rational> =>
  denominator === 0n
    ? Option.none()
    : Option.some(reduce(numerator, denominator));

/** Throws a `RangeError` on a zero denominator. */
export const makeUnsafe = (
  numerator: bigint,
  denominator: bigint = 1n,
): Rational => {
  if (denominator === 0n) {
    throw new RangeError("Rational.makeUnsafe: zero denominator");
  }
  return reduce(numerator, denominator);
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

/** Field-wise equality—sound because every rational is stored reduced. */
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
 * Cross-multiplication comparison—denominators are always positive, so no
 * sign flip is needed.
 */
export const Order: order.Order<Rational> = order.make((a, b) => {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;
  return left < right ? -1 : left > right ? 1 : 0;
});

export const isLessThan = order.isLessThan(Order);

export const isLessThanOrEqualTo = order.isLessThanOrEqualTo(Order);

export const isGreaterThan = order.isGreaterThan(Order);

export const isGreaterThanOrEqualTo = order.isGreaterThanOrEqualTo(Order);

export const min = order.min(Order);

export const max = order.max(Order);

export const clamp = order.clamp(Order);

export const isBetween = order.isBetween(Order);

// Arithmetic

export const sum: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational =>
    reduce(
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
    reduce(
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
    reduce(a.numerator * b.numerator, a.denominator * b.denominator),
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
export const reciprocalUnsafe = (r: Rational): Rational => {
  if (r.numerator === 0n) {
    throw new RangeError("Division by zero");
  }
  return r.numerator < 0n
    ? ofReduced(-r.denominator, -r.numerator)
    : ofReduced(r.denominator, r.numerator);
};

/** Returns `Option.none()` when the divisor is zero—ℚ has no infinities. */
export const divide: {
  (b: Rational): (a: Rational) => Option.Option<Rational>;
  (a: Rational, b: Rational): Option.Option<Rational>;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Option.Option<Rational> =>
    Option.map(reciprocal(b), (rb) => multiply(a, rb)),
);

/** Throws a `RangeError` when the divisor is zero. */
export const divideUnsafe: {
  (b: Rational): (a: Rational) => Rational;
  (a: Rational, b: Rational): Rational;
} = Function.dual(
  2,
  (a: Rational, b: Rational): Rational => multiply(a, reciprocalUnsafe(b)),
);

export const sumAll = (collection: Iterable<Rational>): Rational =>
  Array.reduce(collection, zero, sum);

export const multiplyAll = (collection: Iterable<Rational>): Rational =>
  Array.reduce(collection, one, multiply);

// Rounding

/**
 * Rounds to the nearest bigint under the given mode (the `RoundingMode`
 * vocabulary of `effect/BigDecimal`; the default, `"half-from-zero"`, is
 * BigDecimal's default). Returns a bigint rather than a Rational because
 * every boundary that rounds—money amounts, nanoseconds, milliseconds—
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

    /** Nearest, resolving an exact tie with `onTie`. */
    const nearest = (onTie: bigint): bigint =>
      twiceRemainder < d ? towardZero : twiceRemainder > d ? fromZero : onTie;

    return Match.value(mode).pipe(
      Match.when("ceil", () => ceil),
      Match.when("floor", () => floor),
      Match.when("to-zero", () => towardZero),
      Match.when("from-zero", () => fromZero),
      Match.when("half-ceil", () => nearest(ceil)),
      Match.when("half-floor", () => nearest(floor)),
      Match.when("half-to-zero", () => nearest(towardZero)),
      Match.when("half-from-zero", () => nearest(fromZero)),
      Match.when("half-even", () =>
        nearest(towardZero % 2n === 0n ? towardZero : fromZero),
      ),
      Match.when("half-odd", () =>
        nearest(towardZero % 2n === 0n ? fromZero : towardZero),
      ),
      Match.exhaustive,
    );
  },
);

// Conversions

/**
 * The exact rational value of a finite double—every finite double is a
 * dyadic rational. Throws a `RangeError` on NaN and ±Infinity.
 */
// Doubling a finite non-integral double is always exact (its magnitude is
// below 2^53), so this recursion terminates with the exact scaled mantissa
//—at most 1075 steps, for the smallest subnormal.
const dyadic = (mantissa: number, denominator: bigint): Rational =>
  Number.isInteger(mantissa)
    ? reduce(globalThis.BigInt(mantissa), denominator)
    : dyadic(mantissa * 2, denominator << 1n);

export const fromNumberUnsafe = (n: number): Rational => {
  if (!Number.isFinite(n)) {
    throw new RangeError(`Rational.fromNumberUnsafe: ${n}`);
  }
  return dyadic(n, 1n);
};

export const fromNumber = (n: number): Option.Option<Rational> =>
  Number.isFinite(n) ? Option.some(fromNumberUnsafe(n)) : Option.none();

const maxSafeInteger = 9007199254740991n;

// No Effect helper covers a bigint's binary width, so this stays on the
// built-in radix conversion.
const bitLength = (n: bigint): number => String.length(n.toString(2));

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
  const scaledA = shift >= 0 ? a << globalThis.BigInt(shift) : a;
  const scaledB = shift >= 0 ? b : b << globalThis.BigInt(-shift);
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
      quotient === 1n << globalThis.BigInt(quotientBits - 1) &&
      remainder === 0n;
    return isExactMidpoint ? 0 : 2 ** -1074;
  }

  // Subnormal results keep fewer than 53 bits (the lowest kept bit is 2^-1074).
  const precision = Math.min(53, leadPosition + 1075);
  const drop = quotientBits - precision;
  const truncated = quotient >> globalThis.BigInt(drop);
  const roundBit = (quotient >> globalThis.BigInt(drop - 1)) & 1n;
  const sticky =
    (quotient & ((1n << globalThis.BigInt(drop - 1)) - 1n)) !== 0n ||
    remainder !== 0n;
  // Ties to even: round up on a set guard bit unless the remainder is
  // exactly half and the kept mantissa is already even.
  const mantissa =
    roundBit === 1n && (sticky || truncated % 2n === 1n)
      ? truncated + 1n
      : truncated;

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
export const toNumberUnsafe = (r: Rational): number =>
  Option.getOrThrowWith(
    toNumber(r),
    () => new RangeError(`Rational.toNumberUnsafe: ${format(r)} overflows`),
  );

export const fromBigDecimal = (bd: BigDecimal.BigDecimal): Rational =>
  bd.scale >= 0
    ? reduce(bd.value, 10n ** globalThis.BigInt(bd.scale))
    : fromBigInt(bd.value * 10n ** globalThis.BigInt(-bd.scale));

/**
 * Rounds to a `BigDecimal` at the given scale—exactly one rounding, made
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
        ? reduce(
            self.numerator * 10n ** globalThis.BigInt(options.scale),
            self.denominator,
          )
        : reduce(
            self.numerator,
            self.denominator * 10n ** globalThis.BigInt(-options.scale),
          );
    return BigDecimal.make(
      round(scaled, options.mode === undefined ? {} : { mode: options.mode }),
      options.scale,
    );
  },
);

/**
 * The exact `BigDecimal` equal to the rational, when one exists—i.e. when
 * the denominator is a product of twos and fives, so the decimal expansion
 * terminates. `Option.none()` otherwise (e.g. 1/3).
 */
/** Divides out every factor of `prime`, returning the rest and the count. */
const factorOut = (
  n: bigint,
  prime: bigint,
  count = 0,
): readonly [rest: bigint, count: number] =>
  n % prime === 0n ? factorOut(n / prime, prime, count + 1) : [n, count];

export const toBigDecimalExact = (
  self: Rational,
): Option.Option<BigDecimal.BigDecimal> => {
  const [withoutTwos, twos] = factorOut(self.denominator, 2n);
  const [rest, fives] = factorOut(withoutTwos, 5n);

  if (rest !== 1n) {
    return Option.none();
  }

  const scale = Math.max(twos, fives);
  return Option.some(
    BigDecimal.make(
      (self.numerator * 10n ** globalThis.BigInt(scale)) / self.denominator,
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
    ? globalThis.String(r.numerator)
    : `${r.numerator}/${r.denominator}`;

const parsePattern = /^(-?\d+)(?:\/([1-9]\d*))?$/;

/**
 * Parses the encoding produced by {@link format} (a denominator of 1 may be
 * spelled out; non-canonical fractions like `"6/4"` reduce on the way in).
 * Returns `Option.none()` for anything else, including zero denominators.
 */
export const fromString = (s: string): Option.Option<Rational> =>
  String.match(parsePattern)(s).pipe(
    Option.flatMap((groups) =>
      Option.map(Option.fromUndefinedOr(groups[1]), (numerator) =>
        reduce(
          globalThis.BigInt(numerator),
          groups[2] === undefined ? 1n : globalThis.BigInt(groups[2]),
        ),
      ),
    ),
  );

/** Throws a `RangeError` on input {@link fromString} would reject. */
export const fromStringUnsafe = (s: string): Rational =>
  Option.getOrThrowWith(
    fromString(s),
    () => new RangeError(`Rational.fromStringUnsafe: ${JSON.stringify(s)}`),
  );

/**
 * The single definition of the canonical string encoding, shared by
 * {@link RationalFromString} and by the `toCodecJson` annotation on
 * {@link Rational}, so the two can never drift apart.
 */
const stringTransformation = {
  decode: SchemaGetter.transformOrFail((s: string) =>
    Option.match(fromString(s), {
      onNone: () =>
        Effect.fail(
          new SchemaIssue.InvalidValue(Option.some(s), {
            message: "not a canonical rational encoding",
          }),
        ),
      onSome: Effect.succeed,
    }),
  ),
  encode: SchemaGetter.transform(format),
};

/**
 * The identity schema: a `Rational` on both sides, decoded from itself.
 *
 * It carries the canonical string encoding as its JSON representation, so
 * `Schema.toCodecJson` derives that codec on demand—including when a
 * rational is nested inside a larger schema of your own.
 * {@link RationalFromString} is the same codec named directly, with a
 * precise `string` encoded type rather than `Json`.
 */
export const Rational = Schema.declare(isRational, {
  identifier: "Rational",
  toFormatter: () => format,
  toArbitrary: () => (fc) =>
    fc
      .tuple(fc.bigInt(), fc.bigInt({ min: 1n }))
      .map(([numerator, denominator]) => makeUnsafe(numerator, denominator)),
  toEquivalence: () => Equivalence,
  toCodecJson: () =>
    Schema.link<Rational>()(Schema.String, stringTransformation),
});

export const RationalFromString = Schema.String.annotate({
  description: "a string to be decoded into a Rational",
})
  .pipe(Schema.decodeTo(Rational, stringTransformation))
  .annotate({ identifier: "RationalFromString" });
