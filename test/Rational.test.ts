import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as BigDecimal from "effect/BigDecimal";
import * as BigInt_ from "effect/BigInt";
import * as Result from "effect/Result";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";
import * as Hash from "effect/Hash";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Rational from "../src/Rational.ts";

const bigIntArb = FastCheck.bigInt({ min: -(2n ** 64n), max: 2n ** 64n });
const positiveBigIntArb = FastCheck.bigInt({ min: 1n, max: 2n ** 32n });

const rational = FastCheck.tuple(bigIntArb, positiveBigIntArb).map(([n, d]) =>
  Rational.makeUnsafe(n, d),
);

const nonZeroRational = rational.filter((r) => !Rational.isZero(r));

const fullRangeDouble = FastCheck.double({
  noDefaultInfinity: true,
  noNaN: true,
});

describe("make", () => {
  it("reduces and normalizes the sign", () => {
    FastCheck.assert(
      FastCheck.property(bigIntArb, positiveBigIntArb, (n, d) => {
        const r = Rational.makeUnsafe(n, d);

        assertTrue(r.denominator > 0n);
        assertEquals(
          BigInt_.gcd(
            r.numerator < 0n ? -r.numerator : r.numerator,
            r.denominator,
          ),
          1n,
        );
      }),
    );
  });

  it("equates equivalent fractions", () => {
    assertTrue(
      Equal.equals(Rational.makeUnsafe(2n, 4n), Rational.makeUnsafe(1n, 2n)),
    );
    assertTrue(
      Equal.equals(Rational.makeUnsafe(1n, -2n), Rational.makeUnsafe(-1n, 2n)),
    );
    assertTrue(Equal.equals(Rational.makeUnsafe(0n, 7n), Rational.zero));
    assertEquals(
      Hash.hash(Rational.makeUnsafe(2n, 4n)),
      Hash.hash(Rational.makeUnsafe(1n, 2n)),
    );
  });

  it("defaults the denominator to one", () => {
    assertTrue(
      Equal.equals(Rational.makeUnsafe(3n), Rational.makeUnsafe(3n, 1n)),
    );
  });

  it("make is None on a zero denominator, makeUnsafe throws", () => {
    assertTrue(Option.isNone(Rational.make(1n, 0n)));
    assertTrue(Option.isNone(Rational.make(0n, 0n)));
    throws(() => Rational.makeUnsafe(1n, 0n));
    throws(() => Rational.makeUnsafe(0n, 0n));
  });

  it("make agrees with makeUnsafe on every valid denominator", () => {
    FastCheck.assert(
      FastCheck.property(bigIntArb, positiveBigIntArb, (n, d) => {
        assertTrue(
          Equal.equals(
            Option.getOrThrow(Rational.make(n, d)),
            Rational.makeUnsafe(n, d),
          ),
        );
      }),
    );
    assertTrue(
      Equal.equals(
        Option.getOrThrow(Rational.make(3n)),
        Rational.makeUnsafe(3n),
      ),
    );
  });
});

describe("field laws", () => {
  it("sum is commutative and associative with identity zero", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, rational, (a, b, c) => {
        assertTrue(Equal.equals(Rational.sum(a, b), Rational.sum(b, a)));
        assertTrue(
          Equal.equals(
            Rational.sum(Rational.sum(a, b), c),
            Rational.sum(a, Rational.sum(b, c)),
          ),
        );
        assertTrue(Equal.equals(Rational.sum(a, Rational.zero), a));
        assertTrue(
          Equal.equals(Rational.sum(a, Rational.negate(a)), Rational.zero),
        );
      }),
    );
  });

  it("multiply is commutative and associative with identity one", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, rational, (a, b, c) => {
        assertTrue(
          Equal.equals(Rational.multiply(a, b), Rational.multiply(b, a)),
        );
        assertTrue(
          Equal.equals(
            Rational.multiply(Rational.multiply(a, b), c),
            Rational.multiply(a, Rational.multiply(b, c)),
          ),
        );
        assertTrue(Equal.equals(Rational.multiply(a, Rational.one), a));
      }),
    );
  });

  it("multiplicative inverses cancel", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroRational, (a) => {
        assertTrue(
          Equal.equals(
            Rational.multiply(a, Rational.reciprocalUnsafe(a)),
            Rational.one,
          ),
        );
      }),
    );
  });

  it("multiplication distributes over addition", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, rational, (a, b, c) => {
        assertTrue(
          Equal.equals(
            Rational.multiply(a, Rational.sum(b, c)),
            Rational.sum(Rational.multiply(a, b), Rational.multiply(a, c)),
          ),
        );
      }),
    );
  });

  it("subtract inverts sum", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, (a, b) => {
        assertTrue(Equal.equals(Rational.subtract(Rational.sum(a, b), b), a));
      }),
    );
  });

  it("sumAll and multiplyAll fold with their identities", () => {
    assertTrue(Equal.equals(Rational.sumAll([]), Rational.zero));
    assertTrue(Equal.equals(Rational.multiplyAll([]), Rational.one));
    assertTrue(
      Equal.equals(
        Rational.sumAll([
          Rational.makeUnsafe(1n, 2n),
          Rational.makeUnsafe(1n, 3n),
        ]),
        Rational.makeUnsafe(5n, 6n),
      ),
    );
    assertTrue(
      Equal.equals(
        Rational.multiplyAll([
          Rational.makeUnsafe(2n, 3n),
          Rational.makeUnsafe(3n, 4n),
        ]),
        Rational.makeUnsafe(1n, 2n),
      ),
    );
  });
});

describe("division", () => {
  it("divide is None exactly on zero divisors", () => {
    FastCheck.assert(
      FastCheck.property(rational, nonZeroRational, (a, b) => {
        const quotient = Rational.divide(a, b);

        assertTrue(Option.isSome(quotient));
        assertTrue(
          Equal.equals(Rational.multiply(Option.getOrThrow(quotient), b), a),
        );
      }),
    );
    assertTrue(Option.isNone(Rational.divide(Rational.one, Rational.zero)));
    assertTrue(Option.isNone(Rational.reciprocal(Rational.zero)));
  });

  it("unsafe forms throw on zero", () => {
    throws(() => Rational.divideUnsafe(Rational.one, Rational.zero));
    throws(() => Rational.reciprocalUnsafe(Rational.zero));
  });
});

describe("order", () => {
  it("agrees with the sign of the difference", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, (a, b) => {
        assertEquals(
          Rational.Order(a, b),
          Rational.sign(Rational.subtract(a, b)),
        );
      }),
    );
  });

  it("derives comparisons, min, max, clamp, and between", () => {
    const half = Rational.makeUnsafe(1n, 2n);
    const third = Rational.makeUnsafe(1n, 3n);

    assertTrue(Rational.isLessThan(third, half));
    assertTrue(Rational.isLessThanOrEqualTo(half, half));
    assertTrue(Rational.isGreaterThan(half, third));
    assertTrue(Rational.isGreaterThanOrEqualTo(third, third));
    assertTrue(Equal.equals(Rational.min(half, third), third));
    assertTrue(Equal.equals(Rational.max(half, third), half));
    assertTrue(
      Equal.equals(
        Rational.clamp(Rational.one, { minimum: third, maximum: half }),
        half,
      ),
    );
    assertTrue(
      Rational.isBetween(third, { minimum: Rational.zero, maximum: half }),
    );
  });
});

describe("guards", () => {
  it("classifies values", () => {
    assertTrue(Rational.isZero(Rational.zero));
    assertTrue(Rational.isInteger(Rational.makeUnsafe(6n, 3n)));
    assertFalse(Rational.isInteger(Rational.makeUnsafe(1n, 2n)));
    assertTrue(Rational.isNegative(Rational.makeUnsafe(1n, -2n)));
    assertTrue(Rational.isPositive(Rational.one));
    assertTrue(Rational.isRational(Rational.one));
    assertFalse(Rational.isRational(1));
  });
});

describe("number conversions", () => {
  it("fromNumber is exact for every finite double", () => {
    FastCheck.assert(
      FastCheck.property(fullRangeDouble, (x) => {
        assertEquals(
          Rational.toNumberUnsafe(Rational.fromNumberUnsafe(x)),
          x === 0 ? 0 : x,
        );
      }),
    );
  });

  it("fromNumber produces known dyadic expansions", () => {
    assertTrue(
      Equal.equals(
        Rational.fromNumberUnsafe(0.1),
        Rational.makeUnsafe(3602879701896397n, 2n ** 55n),
      ),
    );
    assertTrue(
      Equal.equals(
        Rational.fromNumberUnsafe(Number.MIN_VALUE),
        Rational.makeUnsafe(1n, 2n ** 1074n),
      ),
    );
    assertTrue(
      Equal.equals(
        Rational.fromNumberUnsafe(Number.MAX_VALUE),
        Rational.makeUnsafe(BigInt(Number.MAX_VALUE)),
      ),
    );
    assertTrue(Equal.equals(Rational.fromNumberUnsafe(-0), Rational.zero));
    assertTrue(Option.isNone(Rational.fromNumber(Number.NaN)));
    assertTrue(Option.isNone(Rational.fromNumber(Infinity)));
    throws(() => Rational.fromNumberUnsafe(Infinity));
  });

  it("toNumber rounds correctly on the fast path", () => {
    assertEquals(Rational.toNumberUnsafe(Rational.makeUnsafe(1n, 3n)), 1 / 3);
    assertEquals(Rational.toNumberUnsafe(Rational.makeUnsafe(-2n, 3n)), -2 / 3);
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(127n, 5000n)),
      0.0254,
    );
    assertEquals(Rational.toNumberUnsafe(Rational.zero), 0);
  });

  it("toNumber rounds correctly with huge operands", () => {
    // ≈ 1/3 with irreducible 600-bit terms: far inside 1/3's rounding
    // interval, so it must land on the same double.
    assertEquals(
      Rational.toNumberUnsafe(
        Rational.makeUnsafe(2n ** 600n + 1n, 3n * 2n ** 600n),
      ),
      1 / 3,
    );
    // Naive Number(2^53 + 1) rounds the denominator first and yields 2^-53;
    // the correctly rounded quotient is one ulp below.
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(1n, 2n ** 53n + 1n)),
      2 ** -53 - 2 ** -106,
    );
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(2n ** 1000n, 3n)),
      2 ** 1000 / 3,
    );
  });

  it("toNumber handles overflow explicitly", () => {
    assertTrue(
      Option.isNone(Rational.toNumber(Rational.makeUnsafe(2n ** 1024n))),
    );
    // The midpoint between MAX_VALUE and 2^1024 ties to even, which carries
    // into overflow.
    assertTrue(
      Option.isNone(
        Rational.toNumber(Rational.makeUnsafe(2n ** 1024n - 2n ** 970n)),
      ),
    );
    assertEquals(
      Rational.toNumber(Rational.makeUnsafe(2n ** 1024n - 2n ** 970n - 1n)),
      Option.some(Number.MAX_VALUE),
    );
    assertEquals(
      Rational.toNumber(Rational.makeUnsafe(-(2n ** 1024n) + 2n ** 970n + 1n)),
      Option.some(-Number.MAX_VALUE),
    );
    throws(() => Rational.toNumberUnsafe(Rational.makeUnsafe(2n ** 1024n)));
  });

  it("toNumber handles subnormals and underflow", () => {
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(1n, 2n ** 1074n)),
      Number.MIN_VALUE,
    );
    // Exactly the midpoint between 0 and MIN_VALUE: ties to even (zero).
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(1n, 2n ** 1075n)),
      0,
    );
    // Just above the midpoint.
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(3n, 2n ** 1076n)),
      Number.MIN_VALUE,
    );
    // Below the midpoint.
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(1n, 2n ** 1076n)),
      0,
    );
  });
});

describe("round", () => {
  const cases: ReadonlyArray<
    readonly [BigDecimal.RoundingMode, ReadonlyArray<readonly [string, bigint]>]
  > = [
    [
      "ceil",
      [
        ["29/2", 15n],
        ["-29/2", -14n],
        ["72/5", 15n],
        ["-72/5", -14n],
      ],
    ],
    [
      "floor",
      [
        ["29/2", 14n],
        ["-29/2", -15n],
        ["72/5", 14n],
        ["-72/5", -15n],
      ],
    ],
    [
      "to-zero",
      [
        ["29/2", 14n],
        ["-29/2", -14n],
        ["73/5", 14n],
        ["-73/5", -14n],
      ],
    ],
    [
      "from-zero",
      [
        ["29/2", 15n],
        ["-29/2", -15n],
        ["72/5", 15n],
        ["-72/5", -15n],
      ],
    ],
    [
      "half-ceil",
      [
        ["29/2", 15n],
        ["-29/2", -14n],
        ["72/5", 14n],
        ["73/5", 15n],
      ],
    ],
    [
      "half-floor",
      [
        ["29/2", 14n],
        ["-29/2", -15n],
        ["72/5", 14n],
        ["-73/5", -15n],
      ],
    ],
    [
      "half-to-zero",
      [
        ["29/2", 14n],
        ["-29/2", -14n],
        ["73/5", 15n],
        ["-73/5", -15n],
      ],
    ],
    [
      "half-from-zero",
      [
        ["29/2", 15n],
        ["-29/2", -15n],
        ["72/5", 14n],
        ["-72/5", -14n],
      ],
    ],
    [
      "half-even",
      [
        ["29/2", 14n],
        ["-29/2", -14n],
        ["31/2", 16n],
        ["-31/2", -16n],
      ],
    ],
    [
      "half-odd",
      [
        ["29/2", 15n],
        ["-29/2", -15n],
        ["31/2", 15n],
        ["-31/2", -15n],
      ],
    ],
  ];

  for (const [mode, expectations] of cases) {
    it(`rounds with mode ${mode}`, () => {
      for (const [input, expected] of expectations) {
        assertEquals(
          Rational.round(Rational.fromStringUnsafe(input), { mode }),
          expected,
        );
      }
    });
  }

  it("defaults to half-from-zero and passes integers through", () => {
    assertEquals(Rational.round(Rational.fromStringUnsafe("29/2")), 15n);
    assertEquals(Rational.round(Rational.fromStringUnsafe("-29/2")), -15n);
    assertEquals(Rational.round(Rational.makeUnsafe(7n)), 7n);
  });
});

describe("BigDecimal interop", () => {
  const bigDecimalArb = FastCheck.tuple(
    bigIntArb,
    FastCheck.integer({ min: -5, max: 20 }),
  ).map(([value, scale]) => BigDecimal.make(value, scale));

  it("fromBigDecimal is exact and toBigDecimalExact inverts it", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimalArb, (bd) => {
        const exact = Rational.toBigDecimalExact(Rational.fromBigDecimal(bd));

        assertTrue(Option.isSome(exact));
        assertTrue(BigDecimal.equals(Option.getOrThrow(exact), bd));
      }),
    );
  });

  it("toBigDecimalExact is None for non-terminating expansions", () => {
    assertTrue(
      Option.isNone(Rational.toBigDecimalExact(Rational.makeUnsafe(1n, 3n))),
    );
    assertTrue(
      Option.isNone(Rational.toBigDecimalExact(Rational.makeUnsafe(1n, 6n))),
    );
    assertTrue(
      Option.isSome(Rational.toBigDecimalExact(Rational.makeUnsafe(1n, 40n))),
    );
  });

  it("toBigDecimal rounds exactly once at the requested scale", () => {
    assertTrue(
      BigDecimal.equals(
        Rational.toBigDecimal(Rational.makeUnsafe(200n, 3n), {
          scale: 0,
          mode: "half-even",
        }),
        BigDecimal.fromStringUnsafe("67"),
      ),
    );
    assertTrue(
      BigDecimal.equals(
        Rational.toBigDecimal(Rational.makeUnsafe(200n, 3n), { scale: 2 }),
        BigDecimal.fromStringUnsafe("66.67"),
      ),
    );
    assertTrue(
      BigDecimal.equals(
        Rational.toBigDecimal(Rational.makeUnsafe(9n, 2n), { scale: 1 }),
        BigDecimal.fromStringUnsafe("4.5"),
      ),
    );
  });
});

describe("format and fromString", () => {
  it("roundtrips through the canonical encoding", () => {
    FastCheck.assert(
      FastCheck.property(rational, (r) => {
        const decoded = Rational.fromString(Rational.format(r));

        assertTrue(Option.isSome(decoded));
        assertTrue(Equal.equals(Option.getOrThrow(decoded), r));
      }),
    );
  });

  it("formats integers without a denominator", () => {
    assertEquals(Rational.format(Rational.makeUnsafe(3n)), "3");
    assertEquals(Rational.format(Rational.makeUnsafe(-3n, 2n)), "-3/2");
    assertEquals(Rational.format(Rational.makeUnsafe(6n, 4n)), "3/2");
  });

  it("reduces non-canonical input and rejects malformed input", () => {
    assertTrue(
      Equal.equals(
        Rational.fromStringUnsafe("6/4"),
        Rational.makeUnsafe(3n, 2n),
      ),
    );
    for (const input of [
      "3/0",
      "3/-2",
      "1.5",
      "+3",
      " 3",
      "3/",
      "",
      "a",
      "3/01",
    ]) {
      assertTrue(Option.isNone(Rational.fromString(input)));
    }
    throws(() => Rational.fromStringUnsafe("3/0"));
  });
});

describe("schema", () => {
  it("roundtrips through the string schema", () => {
    FastCheck.assert(
      FastCheck.property(rational, (r) => {
        const encoded = Schema.encodeSync(Rational.RationalFromString)(r);

        assertEquals(encoded, Rational.format(r));
        assertTrue(
          Equal.equals(
            Schema.decodeSync(Rational.RationalFromString)(encoded),
            r,
          ),
        );
      }),
    );
  });

  it("rejects malformed strings", () => {
    assertTrue(
      Result.isFailure(Schema.decodeResult(Rational.RationalFromString)("3/0")),
    );
    assertTrue(
      Result.isFailure(Schema.decodeResult(Rational.RationalFromString)("1.5")),
    );
  });

  it("Rational validates by guard", () => {
    assertTrue(Schema.is(Rational.Rational)(Rational.one));
    assertFalse(Schema.is(Rational.Rational)(1));
  });
});

describe("inspection", () => {
  it("formats via Inspectable", () => {
    deepStrictEqual(Rational.makeUnsafe(3n, 2n).toJSON(), {
      _id: "Rational",
      numerator: "3",
      denominator: "2",
    });
  });
});

describe("type-level", () => {
  it("infers Option shapes for partial operations", () => {
    // Compile-time inference checks.
    const r: Rational.Rational = Rational.makeUnsafe(1n, 2n);
    const quotient: Option.Option<Rational.Rational> = Rational.divide(
      r,
      Rational.one,
    );
    const rounded: bigint = Rational.round(r);

    assertTrue(Option.isSome(quotient));
    assertEquals(rounded, 1n);
  });
});
