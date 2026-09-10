import { describe, expect, expectTypeOf, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as Array from "effect/Array";
import * as BigDecimal from "effect/BigDecimal";
import * as Result from "effect/Result";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import { isCloseTo, double } from "./testUtils.ts";
import * as Dimensionless from "../src/Dimensionless.ts";
import * as Length from "../src/Length.ts";
import * as Mass from "../src/Mass.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Unit from "../src/Unit.ts";

const nonZeroDouble = double.filter((n) => n !== 0);
const CustomRate = Unit.rate(Unit.custom("USD"), Unit.custom("Count"));
type CustomRate = Quantity.Quantity<typeof CustomRate>;
const customRate = (value: number): CustomRate =>
  Quantity.make(CustomRate, value);

describe("point-free reducers", () => {
  it("preserves accumulator units for same-unit operations", () => {
    const rates = [customRate(1), customRate(2)];

    const zero = customRate(0);
    const total = Array.reduce(rates, zero, Quantity.sum);
    const difference = Array.reduce(rates, zero, Quantity.subtract);
    const minimum = Array.reduce(rates, zero, Quantity.min);
    const maximum = Array.reduce(rates, zero, Quantity.max);

    expectTypeOf(total).toEqualTypeOf<CustomRate>();
    expectTypeOf(difference).toEqualTypeOf<CustomRate>();
    expectTypeOf(minimum).toEqualTypeOf<CustomRate>();
    expectTypeOf(maximum).toEqualTypeOf<CustomRate>();
  });

  it("preserves accumulator units for scalar operations", () => {
    const scalars = [2, 3];
    const initial = customRate(1);

    const product = Array.reduce(scalars, initial, Quantity.multiply);
    const quotient = Array.reduce(scalars, initial, Quantity.divide);

    expectTypeOf(product).toEqualTypeOf<CustomRate>();
    expectTypeOf(quotient).toEqualTypeOf<CustomRate>();
  });

  it("preserves accumulator units for dimensionless operations", () => {
    const factors = [Dimensionless.fraction(2), Dimensionless.fraction(3)];
    const initial = customRate(1);

    const product = Array.reduce(factors, initial, Quantity.times);
    const quotient = Array.reduce(factors, initial, Quantity.over);
    const flippedQuotient = Array.reduce(factors, initial, Quantity.over_);

    expectTypeOf(product).toEqualTypeOf<CustomRate>();
    expectTypeOf(quotient).toEqualTypeOf<CustomRate>();
    expectTypeOf(flippedQuotient).toEqualTypeOf<CustomRate>();
  });

  it("preserves explicit unit arguments for data-last calls", () => {
    const addOne = Quantity.sum<Length.Meters>(Length.meters(1));

    expectTypeOf(addOne).toEqualTypeOf<
      (a: Quantity.Quantity<Length.Meters>) => Quantity.Quantity<Length.Meters>
    >();
  });

  it("rejects incomplete quantities and mixed units", () => {
    const brandedOnly: { readonly [Quantity.TypeId]: Quantity.TypeId } = {
      [Quantity.TypeId]: Quantity.TypeId,
    };

    if (globalThis.Boolean(false)) {
      // @ts-expect-error A TypeId without the Quantity fields is not a quantity.
      Quantity.multiply(brandedOnly, 2);
      // @ts-expect-error The data-last overload also requires a complete quantity.
      Quantity.sum(brandedOnly);
      // @ts-expect-error Same-unit operations cannot combine different units.
      Quantity.sum(Length.meters(1), Mass.kilograms(1));
    }
  });
});

describe("fromBigDecimal / toBigDecimal", () => {
  it("supports direct and curried construction with precise units", () => {
    const decimal = BigDecimal.fromStringUnsafe("1.25");
    const direct = Quantity.fromBigDecimal("Meters", decimal);
    const curried = decimal.pipe(Quantity.fromBigDecimal("Meters"));
    expectTypeOf(direct).toEqualTypeOf<Quantity.Quantity<"Meters">>();
    expectTypeOf(curried).toEqualTypeOf<Quantity.Quantity<"Meters">>();
    expect(Quantity.equals(direct, curried)).toBe(true);
    expect(direct.value).toBe(1.25);
    const rate = Unit.rate(Unit.custom("USD"), Unit.custom("Count"));
    const quantity = Quantity.fromBigDecimal(rate, decimal);
    expectTypeOf(quantity).toEqualTypeOf<Quantity.Quantity<typeof rate>>();
    expect(Unit.equals(quantity.unit, rate)).toBe(true);
  });

  it("round-trips up to 15 significant decimal digits in a normal finite range", () => {
    FastCheck.assert(
      FastCheck.property(
        FastCheck.bigInt({
          min: -999_999_999_999_999n,
          max: 999_999_999_999_999n,
        }),
        FastCheck.integer({ min: -293, max: 307 }),
        (coefficient, scale) => {
          const decimal = BigDecimal.make(coefficient, scale);
          const quantity = Quantity.fromBigDecimal("Meters", decimal);
          const recovered = Option.getOrThrow(Quantity.toBigDecimal(quantity));
          expect(BigDecimal.equals(recovered, decimal)).toBe(true);
        },
      ),
      { numRuns: 5000 },
    );
  });

  it("handles overflow, underflow, and precision beyond the round-trip guarantee", () => {
    for (const [input, value] of [
      ["1e309", Infinity],
      ["-1e309", -Infinity],
      ["1e-400", 0],
      ["-1e-400", 0],
      ["9007199254740993", 9007199254740992],
      ["9007199254740995", 9007199254740996],
    ] as const) {
      expect(
        Quantity.fromBigDecimal("Meters", BigDecimal.fromStringUnsafe(input))
          .value,
      ).toBe(value);
    }
    const subnormal = BigDecimal.fromStringUnsafe("1.23456789012345e-310");
    const recovered = Option.getOrThrow(
      Quantity.toBigDecimal(Quantity.fromBigDecimal("Meters", subnormal)),
    );
    expect(BigDecimal.equals(recovered, subnormal)).toBe(false);
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(
        Option.isNone(Quantity.toBigDecimal(Quantity.make("Meters", value))),
      ).toBe(true);
    }
  });

  it("round-trips normal-range boundary decimals and finite double inputs", () => {
    for (const input of [
      "2.22507385850721e-308",
      "-2.22507385850721e-308",
      "1.79769313486231e308",
      "-1.79769313486231e308",
      "0.000",
      "1.2300",
    ]) {
      const decimal = BigDecimal.fromStringUnsafe(input);
      const recovered = Option.getOrThrow(
        Quantity.toBigDecimal(Quantity.fromBigDecimal("Meters", decimal)),
      );
      expect(BigDecimal.equals(recovered, decimal)).toBe(true);
    }
    FastCheck.assert(
      FastCheck.property(
        FastCheck.double({ noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const quantity = Quantity.make("Meters", value);
          const decimal = Option.getOrThrow(Quantity.toBigDecimal(quantity));
          expect(Quantity.fromBigDecimal("Meters", decimal).value).toBe(
            quantity.value,
          );
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("uses shortest decimal printing rather than the exact binary fraction", () => {
    const decimal = Option.getOrThrow(
      Quantity.toBigDecimal(Quantity.make("Meters", 0.1)),
    );
    expect(BigDecimal.equals(decimal, BigDecimal.make(1n, 1))).toBe(true);
    const computed = Option.getOrThrow(
      Quantity.toBigDecimal(Quantity.make("Meters", 0.1 + 0.2)),
    );
    expect(BigDecimal.equals(computed, BigDecimal.make(3n, 1))).toBe(false);
  });

  it("shifts a decimal scale before rounding for cents-backed custom units", () => {
    const Usd = Unit.custom("USD");
    const dollars = BigDecimal.fromStringUnsafe("0.29");
    const cents = Quantity.fromBigDecimal(
      Usd,
      BigDecimal.make(dollars.value, dollars.scale - 2),
    );
    expect(cents.value).toBe(29);
    expect(0.29 * 100).not.toBe(29);
    const recoveredCents = Option.getOrThrow(Quantity.toBigDecimal(cents));
    const recoveredDollars = BigDecimal.make(
      recoveredCents.value,
      recoveredCents.scale + 2,
    );
    expect(BigDecimal.equals(recoveredDollars, dollars)).toBe(true);
  });

  it("converts custom-unit values to decimals without display scaling", () => {
    const Usd = Unit.custom("USD");
    const output = Quantity.toBigDecimal(Quantity.make(Usd, 425));

    expect(
      BigDecimal.equals(Option.getOrThrow(output), BigDecimal.make(425n, 0)),
    ).toBe(true);
  });
});

describe("make", () => {
  it("stores numeric values without imposing an integer or safe-range invariant", () => {
    const unit = Unit.custom("USD");
    for (const value of [
      0,
      -425,
      Number.MAX_SAFE_INTEGER,
      -Number.MAX_SAFE_INTEGER,
      0.5,
      Number.MAX_SAFE_INTEGER + 1,
      -Number.MAX_SAFE_INTEGER - 1,
      NaN,
      Infinity,
      -Infinity,
    ]) {
      const quantity = Quantity.make(unit, value);
      assertEquals(quantity.value, value);
      assertTrue(Unit.equals(quantity.unit, unit));
    }
  });
});

describe("multiply", () => {
  it("can exceed the safe-integer range from a safe-integer input", () => {
    const unit = Unit.custom("USD");
    const result = Quantity.multiply(
      Quantity.make(unit, Number.MAX_SAFE_INTEGER),
      2,
    );

    assertEquals(result.value, Number.MAX_SAFE_INTEGER * 2);
    assertFalse(Number.isSafeInteger(result.value));
    assertTrue(Unit.equals(result.unit, unit));
  });

  const baseQuantities = [
    { label: "Length", constructor: Length.meters },
    { label: "Mass", constructor: Mass.kilograms },
  ];

  Array.forEach(baseQuantities, (baseQuantity) => {
    it(`number * Quantity (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(double, double, (a, b) => {
          const quantityProduct = Quantity.multiply(
            baseQuantity.constructor(a),
            b,
          );

          assertTrue(isCloseTo(quantityProduct.value, a * b));
        }),
      );
    });

    it(`Quantity * number (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(double, double, (a, b) => {
          const quantityProduct = Quantity.multiply(
            a,
            baseQuantity.constructor(b),
          );

          assertTrue(isCloseTo(quantityProduct.value, a * b));
        }),
      );
    });
  });
});

describe("times", () => {
  it("multiplies values and forms a Product unit", () => {
    FastCheck.assert(
      FastCheck.property(double, double, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));

        assertEquals(product.value, a * b);
        assertTrue(
          Unit.equals(
            product.unit,
            Unit.product(Length.Meters, Mass.Kilograms),
          ),
        );
      }),
    );
  });

  it("over recovers the left factor", () => {
    FastCheck.assert(
      FastCheck.property(double, nonZeroDouble, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));
        const recovered = Quantity.over(product, Mass.kilograms(b));

        assertTrue(Unit.equals(recovered.unit, Length.Meters));
        assertTrue(isCloseTo(recovered.value, a));
      }),
    );
  });

  it("over_ recovers the right factor", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroDouble, double, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));
        const recovered = Quantity.over_(product, Length.meters(a));

        assertTrue(Unit.equals(recovered.unit, Mass.Kilograms));
        assertTrue(isCloseTo(recovered.value, b));
      }),
    );
  });
});

describe("squared/cubed", () => {
  it("squared multiplies a quantity by itself", () => {
    FastCheck.assert(
      FastCheck.property(double, (a) => {
        const squared = Quantity.squared(Length.meters(a));

        assertEquals(squared.value, a * a);
        assertTrue(Unit.equals(squared.unit, Unit.squared(Length.Meters)));
      }),
    );
  });

  it("cubed multiplies a quantity by itself twice", () => {
    FastCheck.assert(
      FastCheck.property(double, (a) => {
        const cubed = Quantity.cubed(Length.meters(a));

        assertEquals(cubed.value, a * a * a);
        assertTrue(Unit.equals(cubed.unit, Unit.cubed(Length.Meters)));
      }),
    );
  });
});

describe("rates", () => {
  const seconds = (n: number) => Quantity.make("Seconds", n);

  it("per and at preserve custom-unit base values without display scaling", () => {
    const unit = Unit.custom("USD");
    const price = Quantity.per(
      Quantity.make(unit, 300),
      Quantity.make("Meters", 2),
    );
    const cost = Quantity.at(price, Quantity.make("Meters", 10));

    assertEquals(price.value, 150);
    assertTrue(Unit.equals(price.unit, Unit.rate(unit, "Meters")));
    assertEquals(cost.value, 1500);
    assertTrue(Unit.equals(cost.unit, unit));
  });

  it("can produce fractional custom-unit values from integer inputs", () => {
    const unit = Unit.custom("USD");
    const result = Quantity.at(
      Quantity.per(Quantity.make(unit, 200), Quantity.make("Meters", 3)),
      Quantity.make("Meters", 1),
    );

    assertEquals(result.value, 200 / 3);
    assertFalse(Number.isSafeInteger(result.value));
    assertTrue(Unit.equals(result.unit, unit));
  });

  it("per divides values and forms a Rate unit", () => {
    FastCheck.assert(
      FastCheck.property(double, nonZeroDouble, (a, b) => {
        const rate = Quantity.per(Length.meters(a), seconds(b));

        assertEquals(rate.value, a / b);
        assertTrue(Unit.equals(rate.unit, Unit.rate(Length.Meters, "Seconds")));
      }),
    );
  });

  it("per by zero is Infinity", () => {
    const rate = Quantity.per(Length.meters(1), seconds(0));

    assertTrue(Quantity.isInfinite(rate));
    assertTrue(Quantity.isNaN(Quantity.per(Length.meters(0), seconds(0))));
  });

  it("at multiplies a rate by an independent quantity", () => {
    // Compile-time inference check: `at` on a Rate<"Meters", "Seconds">
    // quantity infers Quantity<"Meters">.
    const inferred: Quantity.Quantity<Length.Meters> = Quantity.at(
      Quantity.make(Unit.rate(Length.Meters, "Seconds"), 1),
      seconds(1),
    );
    assertEquals(inferred.value, 1);

    FastCheck.assert(
      FastCheck.property(double, double, (r, i) => {
        const rate = Quantity.make(Unit.rate(Length.Meters, "Seconds"), r);
        const dependent = Quantity.at(rate, seconds(i));

        assertEquals(dependent.value, r * i);
        assertTrue(Unit.equals(dependent.unit, Length.Meters));
      }),
    );
  });

  it("for_ matches at with flipped arguments", () => {
    FastCheck.assert(
      FastCheck.property(double, double, (r, i) => {
        const rate = Quantity.make(Unit.rate(Length.Meters, "Seconds"), r);

        assertTrue(
          Equal.equals(
            Quantity.for_(seconds(i), rate),
            Quantity.at(rate, seconds(i)),
          ),
        );
      }),
    );
  });

  it("at_ inverts at", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroDouble, double, (r, i) => {
        const rate = Quantity.make(Unit.rate(Length.Meters, "Seconds"), r);
        const dependent = Quantity.at(rate, seconds(i));
        const recovered = Quantity.at_(dependent, rate);

        assertTrue(Unit.equals(recovered.unit, "Seconds"));
        assertTrue(isCloseTo(recovered.value, i));
      }),
    );
  });
});

describe("dimensionless", () => {
  it("ratio collapses same-unit division to Unitless", () => {
    FastCheck.assert(
      FastCheck.property(double, nonZeroDouble, (a, b) => {
        const r = Quantity.ratio(Length.meters(a), Length.meters(b));

        assertTrue(Unit.equals(r.unit, "Unitless"));
        assertEquals(r.value, a / b);
      }),
    );
  });

  it("ratio erases the units it came from", () => {
    assertTrue(
      Equal.equals(
        Quantity.ratio(Length.meters(1), Length.meters(4)),
        Quantity.ratio(Mass.kilograms(1), Mass.kilograms(4)),
      ),
    );
  });

  it("ratio by zero is Infinity", () => {
    assertTrue(
      Quantity.isInfinite(Quantity.ratio(Length.meters(1), Length.meters(0))),
    );
    assertTrue(
      Quantity.isNaN(Quantity.ratio(Length.meters(0), Length.meters(0))),
    );
  });

  it("times by a dimensionless factor scales, in either argument order", () => {
    // Compile-time inference check: the dimensionless overload keeps the
    // Length, where the general one would give Product<"Meters", "Unitless">.
    const scaled: Quantity.Quantity<Length.Meters> = Quantity.times(
      Length.meters(200),
      Dimensionless.percent(90),
    );
    const flipped: Quantity.Quantity<Length.Meters> = Quantity.times(
      Dimensionless.percent(90),
      Length.meters(200),
    );

    assertTrue(Unit.equals(scaled.unit, Length.Meters));
    assertTrue(isCloseTo(scaled.value, 180));
    assertTrue(Equal.equals(flipped, scaled));
  });

  it("times by one is the identity", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        assertTrue(
          Equal.equals(
            Quantity.times(Length.meters(n), Dimensionless.one),
            Length.meters(n),
          ),
        );
      }),
    );
  });

  it("times composes two dimensionless factors into one", () => {
    const half: Dimensionless.Dimensionless = Quantity.times(
      Dimensionless.percent(50),
      Dimensionless.percent(50),
    );

    assertTrue(isCloseTo(Dimensionless.inPercent(half), 25));
  });

  it("squared and cubed leave a dimensionless quantity dimensionless", () => {
    const squared: Dimensionless.Dimensionless = Quantity.squared(
      Dimensionless.percent(50),
    );
    const cubed: Dimensionless.Dimensionless = Quantity.cubed(
      Dimensionless.percent(50),
    );

    assertTrue(isCloseTo(Dimensionless.inPercent(squared), 25));
    assertTrue(isCloseTo(Dimensionless.inPercent(cubed), 12.5));

    // The dimensioned path is untouched.
    const area: Quantity.Quantity<Unit.Squared<Length.Meters>> =
      Quantity.squared(Length.meters(3));
    assertTrue(Unit.equals(area.unit, Unit.squared(Length.Meters)));
  });

  it("over and over_ divide by a dimensionless factor without peeling", () => {
    FastCheck.assert(
      FastCheck.property(double, nonZeroDouble, (n, f) => {
        const factor = Dimensionless.fraction(f);
        const scaled = Quantity.times(Length.meters(n), factor);
        const divided: Quantity.Quantity<Length.Meters> = Quantity.over(
          scaled,
          factor,
        );

        assertTrue(isCloseTo(divided.value, n));
        // For a pure number there is no left or right factor to choose
        // between, so over_ does the same thing.
        assertTrue(Equal.equals(Quantity.over_(scaled, factor), divided));
      }),
    );
  });

  it("does not fold a custom unit that happens to be named Unitless", () => {
    // Custom leaves are distinct from base units with the same name, so this
    // one composes into a Product like any other.
    const fake = Quantity.make(Unit.custom("Unitless"), 2);
    const product = Quantity.times(Length.meters(3), fake);

    assertTrue(
      Unit.equals(
        product.unit,
        Unit.product(Length.Meters, Unit.custom("Unitless")),
      ),
    );
    assertEquals(product.value, 6);
  });

  it("undoes the fold when a generic product is peeled apart", () => {
    // Code generic in its units selects the general overload, so `times` is
    // typed Product<U1, U2> while the runtime folds the dimensionless factor
    // away. Peeling that apart has to undo the fold rather than reach for a
    // factor the unit tree does not have—which would leave `unit` undefined
    // and blow up in `Unit.encode`, `Hash`, and every schema.
    const compose = <U1 extends Unit.Unit, U2 extends Unit.Unit>(
      a: Quantity.Quantity<U1>,
      b: Quantity.Quantity<U2>,
    ): Quantity.Quantity<Unit.Product<U1, U2>> => Quantity.times(a, b);

    const foldedLeft = compose(Dimensionless.one, Length.meters(3));
    const foldedRight = compose(Length.meters(3), Dimensionless.one);

    assertTrue(Unit.equals(foldedLeft.unit, Length.Meters));
    assertTrue(Unit.equals(foldedRight.unit, Length.Meters));

    // over drops the right factor, leaving the folded left one, and over_
    // mirrors it—each landing on the Unitless the type already promised.
    const left: Quantity.Quantity<"Unitless"> = Quantity.over(
      foldedLeft,
      Length.meters(3),
    );
    const right: Quantity.Quantity<"Unitless"> = Quantity.over_(
      foldedRight,
      Length.meters(3),
    );

    Array.forEach([left, right], (peeled) => {
      assertTrue(Unit.equals(peeled.unit, "Unitless"));
      assertEquals(Dimensionless.inFraction(peeled), 1);
      assertEquals(Unit.encode(peeled.unit), "Unitless");
    });
  });

  it("keeps the general overloads reducible in generic code", () => {
    // The dimensionless overloads must not push callers into a deferred
    // conditional type: code generic in its units still gets a plain
    // Product back, and code generic over a scaled quantity keeps its unit.
    const scale = <U extends Unit.Unit>(
      a: Quantity.Quantity<U>,
      factor: Dimensionless.Dimensionless,
    ): Quantity.Quantity<U> => Quantity.times(a, factor);

    const compose = <U1 extends Unit.Unit, U2 extends Unit.Unit>(
      a: Quantity.Quantity<U1>,
      b: Quantity.Quantity<U2>,
    ): Quantity.Quantity<Unit.Product<U1, U2>> => Quantity.times(a, b);

    assertTrue(
      isCloseTo(scale(Length.meters(4), Dimensionless.percent(50)).value, 2),
    );
    assertTrue(
      Unit.equals(
        compose(Length.meters(2), Mass.kilograms(3)).unit,
        Unit.product(Length.Meters, "Kilograms"),
      ),
    );
  });

  it("data-last forms match data-first", () => {
    const length = Length.meters(8);
    const factor = Dimensionless.percent(25);

    assertTrue(
      Equal.equals(
        length.pipe(Quantity.times(factor)),
        Quantity.times(length, factor),
      ),
    );
    assertTrue(
      Equal.equals(
        length.pipe(Quantity.over(factor)),
        Quantity.over(length, factor),
      ),
    );
    assertTrue(
      Equal.equals(
        length.pipe(Quantity.over_(factor)),
        Quantity.over_(length, factor),
      ),
    );
    assertTrue(
      Equal.equals(
        length.pipe(Quantity.ratio(Length.meters(2))),
        Quantity.ratio(length, Length.meters(2)),
      ),
    );
  });
});

describe("schema", () => {
  const Count = Unit.custom("Count");
  const count = (value: number) => Quantity.make(Count, value);

  describe("QuantityFromValue", () => {
    it("round-trips base, custom, and derived units as bare numbers", () => {
      for (const unit of [
        "Meters",
        Count,
        Unit.rate(Count, "Seconds"),
      ] as const) {
        const codec = Quantity.QuantityFromValue(unit);
        for (const value of [0, -1, 1.5, Number.MAX_VALUE, Number.MIN_VALUE]) {
          const quantity = Schema.decodeUnknownSync(codec)(value);
          expect(Quantity.equals(quantity, Quantity.make(unit, value))).toBe(
            true,
          );
          expect(Schema.encodeSync(codec)(quantity)).toBe(value);
        }
      }
    });

    it("rejects non-finite values, invalid wires, and the wrong unit", () => {
      const codec = Quantity.QuantityFromValue(Count);
      for (const value of [NaN, Infinity, -Infinity, "1", null, { value: 1 }]) {
        expect(Result.isFailure(Schema.decodeUnknownResult(codec)(value))).toBe(
          true,
        );
      }
      for (const value of [NaN, Infinity, -Infinity]) {
        expect(Result.isFailure(Schema.encodeResult(codec)(count(value)))).toBe(
          true,
        );
      }
      expect(
        Result.isFailure(Schema.encodeUnknownResult(codec)(Length.meters(1))),
      ).toBe(true);
    });

    it("preserves the precise types and explicit bare-value JSON codec", () => {
      const codec = Quantity.QuantityFromValue(Count);
      expectTypeOf<typeof codec.Type>().toEqualTypeOf<
        Quantity.Quantity<typeof Count>
      >();
      expectTypeOf<typeof codec.Encoded>().toEqualTypeOf<number>();
      const json = Schema.toCodecJson(Schema.Struct({ count: codec }));
      expect(Schema.encodeSync(json)({ count: count(2) })).toEqual({
        count: 2,
      });
      expect(Schema.decodeUnknownSync(json)({ count: 2 }).count.value).toBe(2);
      const canonical = Schema.toCodecJson(Quantity.Quantity(Count));
      expect(Schema.encodeSync(canonical)(count(2))).toEqual({
        unit: "[Count]",
        value: 2,
      });
    });

    it("normalizes negative zero", () => {
      const codec = Quantity.QuantityFromValue(Count);
      expect(Object.is(Schema.decodeUnknownSync(codec)(-0).value, 0)).toBe(
        true,
      );
    });

    it("composes numeric wire checks before the quantity conversion", () => {
      const codec = Schema.Int.check(Schema.isGreaterThan(0)).pipe(
        Schema.decodeTo(Quantity.QuantityFromValue(Count)),
      );
      expect(Schema.decodeUnknownSync(codec)(2).value).toBe(2);
      expect(Schema.encodeSync(codec)(count(2))).toBe(2);
      for (const value of [0, -1, 1.5]) {
        expect(Result.isFailure(Schema.decodeUnknownResult(codec)(value))).toBe(
          true,
        );
        expect(Result.isFailure(Schema.encodeResult(codec)(count(value)))).toBe(
          true,
        );
      }
    });
  });

  describe("quantity refinements", () => {
    it("preserves existing arbitrary annotations while applying checks", () => {
      const schema = Quantity.positive(
        Length.Length.annotate(
          Quantity.arbitraryOnGrid("Meters", { step: 0.1, min: -1, max: 1 }),
        ),
      );
      FastCheck.assert(
        FastCheck.property(Schema.toArbitrary(schema), (quantity) => {
          expect(quantity.value).toBeGreaterThan(0);
          expect(quantity.value).toBeLessThanOrEqual(1);
          expect(quantity.value).toBe(Number(quantity.value.toFixed(1)));
          expect(Unit.equals(quantity.unit, "Meters")).toBe(true);
        }),
      );
    });

    it("checks positivity and non-negativity without changing wire types", () => {
      const positive = Quantity.positive(Quantity.QuantityFromValue(Count));
      const nonNegative = Quantity.nonNegative(
        Quantity.QuantityFromStruct(Count),
      );
      expectTypeOf<typeof positive.Encoded>().toEqualTypeOf<number>();
      expectTypeOf<typeof nonNegative.Encoded>().toEqualTypeOf<{
        readonly unit: string;
        readonly value: number;
      }>();
      expect(Schema.decodeUnknownSync(positive)(1).value).toBe(1);
      expect(Schema.encodeSync(positive)(count(1))).toBe(1);
      for (const value of [0, -0, -1]) {
        expect(
          Result.isFailure(Schema.decodeUnknownResult(positive)(value)),
        ).toBe(true);
        expect(
          Result.isFailure(Schema.encodeResult(positive)(count(value))),
        ).toBe(true);
      }
      for (const value of [0, -0, 1]) {
        expect(
          Schema.decodeUnknownSync(nonNegative)({ unit: "[Count]", value })
            .value,
        ).toBe(value === 0 ? 0 : value);
      }
      expect(
        Result.isFailure(Schema.encodeResult(nonNegative)(count(-1))),
      ).toBe(true);
    });

    it("uses quantity comparisons for built-in and derived units", () => {
      const minimumLength = Length.LengthFromStruct.check(
        Quantity.greaterThanOrEqualTo(Length.centimeters(100)),
      );
      expect(Schema.encodeSync(minimumLength)(Length.meters(1)).value).toBe(1);
      expect(
        Result.isFailure(
          Schema.encodeResult(minimumLength)(Length.centimeters(99)),
        ),
      ).toBe(true);
      const rate = Unit.rate(Count, "Seconds");
      const codec = Quantity.QuantityFromValue(rate).check(
        Quantity.greaterThanOrEqualTo(Quantity.make(rate, 2)),
      );
      expect(Schema.decodeUnknownSync(codec)(2).value).toBe(2);
      expect(Result.isFailure(Schema.decodeUnknownResult(codec)(1))).toBe(true);
    });

    it("rejects mismatched bound units statically and dynamically", () => {
      const codec = Quantity.QuantityFromValue(Count);
      if (globalThis.Boolean(false)) {
        // @ts-expect-error A length bound cannot refine counts.
        codec.check(Quantity.greaterThanOrEqualTo(Length.meters(1)));
        // @ts-expect-error A number schema does not decode quantities.
        Quantity.positive(Schema.Number);
      }
      const broadBound: Quantity.Quantity<Unit.Unit> = Length.meters(1);
      const checked = codec.check(Quantity.greaterThanOrEqualTo(broadBound));
      expect(Result.isFailure(Schema.decodeUnknownResult(checked)(2))).toBe(
        true,
      );
    });

    it("reports unit-aware defaults and supports custom messages", () => {
      const positive = Quantity.positive(Quantity.Quantity(Count));
      const nonNegative = Quantity.nonNegative(Quantity.Quantity(Count));
      const bounded = Quantity.Quantity(Count).check(
        Quantity.greaterThanOrEqualTo(count(1)),
      );
      expect(() => Schema.decodeUnknownSync(positive)(count(0))).toThrow(
        "positive quantity in [Count]",
      );
      expect(() => Schema.decodeUnknownSync(nonNegative)(count(-1))).toThrow(
        "non-negative quantity in [Count]",
      );
      expect(() => Schema.decodeUnknownSync(bounded)(count(0))).toThrow(
        "greater than or equal to 1 [Count]",
      );
      for (const codec of [
        Quantity.positive(Quantity.Quantity(Count), {
          message: "A count is required",
        }),
        Quantity.nonNegative(Quantity.Quantity(Count), {
          message: "A count is required",
        }),
        Quantity.Quantity(Count).check(
          Quantity.greaterThanOrEqualTo(count(1), {
            message: "A count is required",
          }),
        ),
      ]) {
        expect(() => Schema.decodeUnknownSync(codec)(count(-1))).toThrow(
          "A count is required",
        );
      }
    });

    it("follows IEEE comparisons while JSON encoding remains finite-only", () => {
      const positive = Quantity.positive(Quantity.Quantity(Count));
      const nonNegative = Quantity.nonNegative(Quantity.Quantity(Count));
      const bounded = Quantity.Quantity(Count).check(
        Quantity.greaterThanOrEqualTo(count(1)),
      );
      for (const schema of [positive, nonNegative, bounded]) {
        expect(Schema.is(schema)(count(NaN))).toBe(false);
        expect(Schema.is(schema)(count(-Infinity))).toBe(false);
        expect(Schema.is(schema)(count(Infinity))).toBe(true);
        const json = Schema.toCodecJson(Schema.Struct({ count: schema }));
        expect(
          Result.isFailure(
            Schema.encodeResult(json)({ count: count(Infinity) }),
          ),
        ).toBe(true);
        expect(
          Result.isFailure(
            Schema.decodeUnknownResult(json)({
              count: { unit: "[Count]", value: -1 },
            }),
          ),
        ).toBe(true);
        expect(Schema.encodeSync(json)({ count: count(1) })).toEqual({
          count: { unit: "[Count]", value: 1 },
        });
      }
    });
  });

  describe("wrapping an existing schema", () => {
    const input = Schema.NumberFromString.check(
      Schema.isInt(),
      Schema.isGreaterThan(0, { message: "Enter a positive whole count" }),
    );
    const codec = input.pipe(
      Schema.decodeTo(
        Quantity.Quantity(Count),
        SchemaTransformation.transform({
          decode: count,
          encode: (quantity) => quantity.value,
        }),
      ),
    );

    it("preserves base validation and messages in both directions", () => {
      expect(Schema.decodeUnknownSync(codec)("2").value).toBe(2);
      expect(Schema.encodeSync(codec)(count(2))).toBe("2");
      expect(() => Schema.decodeUnknownSync(codec)("0")).toThrow(
        "Enter a positive whole count",
      );
      expect(() => Schema.encodeSync(codec)(count(0))).toThrow(
        "Enter a positive whole count",
      );
      expect(Result.isFailure(Schema.decodeUnknownResult(codec)("1.5"))).toBe(
        true,
      );
      expect(Result.isFailure(Schema.encodeResult(codec)(count(1.5)))).toBe(
        true,
      );
    });

    it("retains existing checks and schema types when refined", () => {
      const refined = Quantity.positive(codec);
      expectTypeOf<typeof refined.Encoded>().toEqualTypeOf<string>();
      expectTypeOf<typeof refined.Type>().toEqualTypeOf<
        Quantity.Quantity<typeof Count>
      >();
      expectTypeOf<typeof refined.DecodingServices>().toEqualTypeOf<
        typeof codec.DecodingServices
      >();
      expectTypeOf<typeof refined.EncodingServices>().toEqualTypeOf<
        typeof codec.EncodingServices
      >();
      expect(Result.isFailure(Schema.decodeUnknownResult(refined)("1.5"))).toBe(
        true,
      );
      expect(Schema.encodeSync(refined)(count(2))).toBe("2");
    });

    it("composes refined quantity codecs with existing encoded representations", () => {
      const PositiveMeters = Quantity.positive(
        Quantity.QuantityFromValue("Meters"),
      );
      const NonNegativeLength = Quantity.nonNegative(Length.LengthFromStruct);
      const AtLeastOneMeter = PositiveMeters.check(
        Quantity.greaterThanOrEqualTo(Length.meters(1)),
      );
      expect(
        Quantity.equals(
          Schema.decodeSync(AtLeastOneMeter)(2),
          Length.meters(2),
        ),
      ).toBe(true);
      expect(Schema.encodeSync(AtLeastOneMeter)(Length.meters(2))).toBe(2);
      expect(Schema.encodeSync(NonNegativeLength)(Length.meters(0))).toEqual({
        unit: "Meters",
        value: 0,
      });

      const ExistingMeters = Schema.NumberFromString.check(
        Schema.isFinite(),
        Schema.isGreaterThan(0, { expected: "a positive distance in meters" }),
      );
      const Distance = ExistingMeters.pipe(
        Schema.decodeTo(
          Quantity.Quantity("Meters"),
          SchemaTransformation.transform({
            decode: (value) => Quantity.make("Meters", value),
            encode: (quantity) => quantity.value,
          }),
        ),
      );
      expect(
        Quantity.equals(
          Schema.decodeSync(Distance)("2"),
          Quantity.make("Meters", 2),
        ),
      ).toBe(true);
      expect(Schema.encodeSync(Distance)(Quantity.make("Meters", 2))).toBe("2");
      expect(() => Schema.decodeSync(Distance)("0")).toThrow(
        "a positive distance in meters",
      );
      expect(() =>
        Schema.encodeSync(Distance)(Quantity.make("Meters", 0)),
      ).toThrow("a positive distance in meters");
      expect(
        Result.isFailure(Schema.decodeUnknownResult(Distance)("Infinity")),
      ).toBe(true);
    });
  });

  it("round-trips custom-unit values without display scaling", () => {
    const unit = Unit.custom("USD");
    const codec = Quantity.QuantityFromStruct(unit);
    const quantity = Quantity.make(unit, 1500);
    const encoded = Schema.encodeSync(codec)(quantity);

    deepStrictEqual(encoded, { unit: "[USD]", value: 1500 });
    assertTrue(Quantity.equals(Schema.decodeSync(codec)(encoded), quantity));
  });

  it("accepts finite fractional and unsafe-integer values without a cents invariant", () => {
    const unit = Unit.custom("USD");
    const codec = Quantity.QuantityFromStruct(unit);

    for (const value of [0.5, Number.MAX_SAFE_INTEGER + 1]) {
      const encoded = { unit: "[USD]", value };
      const decoded = Schema.decodeSync(codec)(encoded);

      assertEquals(decoded.value, value);
      assertTrue(Unit.equals(decoded.unit, unit));
      deepStrictEqual(Schema.encodeSync(codec)(decoded), encoded);
    }
  });

  it("accepts a retained custom id and rejects a changed id", () => {
    const original = Unit.custom("Units");
    const renamed = Unit.custom("Units");
    const stored = Schema.encodeSync(Quantity.QuantityFromStruct(original))(
      Quantity.make(original, 3),
    );
    const codec = Quantity.QuantityFromStruct(renamed);
    const decoded = Schema.decodeSync(codec)(stored);

    assertTrue(Quantity.equals(decoded, Quantity.make(renamed, 3)));
    deepStrictEqual(Schema.encodeSync(codec)(decoded), {
      unit: "[Units]",
      value: 3,
    });
    assertTrue(
      Result.isFailure(
        Schema.decodeUnknownResult(
          Quantity.QuantityFromStruct(Unit.custom("Count")),
        )(stored),
      ),
    );
  });

  it("enforces custom ids inside derived rate and product wires", () => {
    const original = Unit.custom("Units");
    const renamed = Unit.custom("Units");
    const changed = Unit.custom("Count");
    const usd = Unit.custom("USD");

    for (const [before, after, different, wire] of [
      [
        Unit.rate(usd, original),
        Unit.rate(usd, renamed),
        Unit.rate(usd, changed),
        "([USD]/[Units])",
      ],
      [
        Unit.product(original, "Meters"),
        Unit.product(renamed, "Meters"),
        Unit.product(changed, "Meters"),
        "([Units]*Meters)",
      ],
    ] as const) {
      const stored = Schema.encodeSync(Quantity.QuantityFromStruct(before))(
        Quantity.make(before, 2),
      );
      deepStrictEqual(stored, { unit: wire, value: 2 });
      const decoded = Schema.decodeSync(Quantity.QuantityFromStruct(after))(
        stored,
      );
      assertTrue(Quantity.equals(decoded, Quantity.make(after, 2)));
      assertTrue(
        Result.isFailure(
          Schema.decodeUnknownResult(Quantity.QuantityFromStruct(different))(
            stored,
          ),
        ),
      );
    }
  });

  it("derives grid-constrained quantities from annotations", () => {
    const MeasuredLength = Length.Length.annotate(
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: -0.35,
        max: 0.75,
      }),
    );
    expectTypeOf(MeasuredLength.Type).toEqualTypeOf<Length.Length>();

    FastCheck.assert(
      FastCheck.property(
        Schema.toArbitrary(MeasuredLength),
        ({ unit, value }) => {
          assertTrue(Unit.equals(unit, Length.Meters));
          assertTrue(value >= -0.3);
          assertTrue(value <= 0.7);
          assertEquals(value, Number(value.toFixed(1)));
        },
      ),
    );

    const SingleValue = Length.Length.annotate(
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 0.3,
        max: 0.3,
      }),
    );
    FastCheck.assert(
      FastCheck.property(Schema.toArbitrary(SingleValue), ({ value }) => {
        assertEquals(value, 0.3);
      }),
    );

    const RoundedBoundary = Length.Length.annotate(
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 0.1 + 0.2,
        max: 0.4,
      }),
    );
    FastCheck.assert(
      FastCheck.property(Schema.toArbitrary(RoundedBoundary), ({ value }) => {
        assertEquals(value, 0.4);
      }),
    );

    for (const value of [-Number.MAX_VALUE, Number.MAX_VALUE]) {
      const Extreme = Length.Length.annotate(
        Quantity.arbitraryOnGrid(Length.Meters, {
          step: Number.MAX_VALUE,
          min: value,
          max: value,
        }),
      );
      FastCheck.assert(
        FastCheck.property(Schema.toArbitrary(Extreme), (quantity) => {
          assertEquals(quantity.value, value);
        }),
      );
    }

    const Tenths = Length.Length.annotate(
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 0.7,
        max: 0.7,
      }),
    );
    FastCheck.assert(
      FastCheck.property(Schema.toArbitrary(Tenths), ({ value }) => {
        assertEquals(value, 0.7);
      }),
    );

    const Piped = Length.Length.annotate(
      Function.pipe(
        Length.Meters,
        Quantity.arbitraryOnGrid({
          step: 1e-2,
          min: 0,
          max: 0.02,
        }),
      ),
    );
    expectTypeOf(Piped.Type).toEqualTypeOf<Length.Length>();
    const pipedValues = FastCheck.sample(Schema.toArbitrary(Piped), 50);
    assertTrue(
      Array.every(
        pipedValues,
        ({ value }) => value === 0 || value === 0.01 || value === 0.02,
      ),
    );
  });

  it("rejects invalid grid options", () => {
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0,
        min: 0,
        max: 1,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: -0.1,
        min: 0,
        max: 1,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: Number.NaN,
        min: 0,
        max: 1,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: Number.POSITIVE_INFINITY,
        max: 1,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 0,
        max: Number.POSITIVE_INFINITY,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 1,
        max: 0,
      }),
    );
    throws(() =>
      Quantity.arbitraryOnGrid(Length.Meters, {
        step: 0.1,
        min: 0.11,
        max: 0.19,
      }),
    );
  });

  it("encodes and decodes a base-unit quantity", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        const quantity = Length.meters(n);
        const encoded = Schema.encodeSync(Length.LengthFromStruct)(quantity);
        const decoded = Schema.decodeSync(Length.LengthFromStruct)(encoded);

        assertEquals(encoded.unit, "Meters");
        assertTrue(Equal.equals(decoded, quantity));
      }),
    );
  });

  it("encodes and decodes a rate quantity, freezing the wire format", () => {
    const MetersPerSecond = Unit.rate(Length.Meters, "Seconds");
    const Speed = Quantity.QuantityFromStruct(MetersPerSecond);

    const quantity = Quantity.make(MetersPerSecond, 1);
    const encoded = Schema.encodeSync(Speed)(quantity);

    deepStrictEqual(encoded, { unit: "(Meters/Seconds)", value: 1 });
    assertTrue(Equal.equals(Schema.decodeSync(Speed)(encoded), quantity));
  });

  it("rejects non-finite values at the wire boundary", () => {
    // In-memory arithmetic produces Infinity/NaN by design, but JSON would
    // silently turn them into null—so encoding must fail loudly instead.
    const MetersPerSecond = Unit.rate(Length.Meters, "Seconds");
    const Speed = Quantity.QuantityFromStruct(MetersPerSecond);
    const infinite = Quantity.per(
      Length.meters(1),
      Quantity.make("Seconds", 0),
    );

    assertTrue(Result.isFailure(Schema.encodeResult(Speed)(infinite)));
    assertTrue(
      Result.isFailure(
        Schema.decodeUnknownResult(Speed)({
          unit: "(Meters/Seconds)",
          value: null,
        }),
      ),
    );
  });

  // The identity schema carries the wire format as a `toCodecJson`
  // annotation. Without it a declaration falls back to `Json` and throws on
  // any non-JSON value, so the nesting test below is a regression test.

  it("derives the same wire format through toCodecJson", () => {
    const quantity = Length.meters(5);

    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Length.Length))(quantity),
      Schema.encodeSync(Length.LengthFromStruct)(quantity),
    );
  });

  it("serializes when nested inside a caller's own schema", () => {
    const Trip = Schema.Struct({
      name: Schema.String,
      distance: Length.Length,
    });
    const codec = Schema.toCodecJson(Trip);
    const trip = { name: "commute", distance: Length.meters(5) };

    const encoded = Schema.encodeSync(codec)(trip);

    deepStrictEqual(encoded, {
      name: "commute",
      distance: { unit: "Meters", value: 5 },
    });

    // Survives an actual JSON round trip, not just structural equality.
    const decoded = Schema.decodeUnknownSync(codec)(
      JSON.parse(JSON.stringify(encoded)),
    );

    assertTrue(Equal.equals(decoded.distance, trip.distance));
  });

  it("rejects non-finite values through toCodecJson too", () => {
    const codec = Schema.toCodecJson(Length.Length);

    assertTrue(
      Result.isFailure(Schema.encodeResult(codec)(Length.meters(Infinity))),
    );
    assertTrue(
      Result.isFailure(Schema.encodeResult(codec)(Length.meters(NaN))),
    );
  });
});

describe("equals", () => {
  it("compares structurally equal units", () => {
    const a = Quantity.make(Unit.rate(Length.Meters, "Seconds"), 1);
    const b = Quantity.make(Unit.rate(Length.Meters, "Seconds"), 1);

    assertTrue(Equal.equals(a, b));
  });

  it("distinguishes different units", () => {
    const a = Quantity.make("Meters", 1);
    const b = Quantity.make("Seconds", 1);

    assertFalse(Equal.equals(a, b));
  });

  it("treats NaN quantities as equal to themselves", () => {
    const a = Quantity.make("Meters", NaN);

    assertTrue(Equal.equals(a, Quantity.make("Meters", NaN)));
  });

  it("normalizes negative zero", () => {
    assertTrue(Equal.equals(Quantity.make("Meters", -0), Length.zero));
    assertEquals(Quantity.make("Meters", -0).value, 0);
  });
});

describe("equalsWithin", () => {
  it("compares within a tolerance quantity", () => {
    assertTrue(
      Quantity.equalsWithin(
        Length.meters(1),
        Length.meters(1.0005),
        Length.millimeters(1),
      ),
    );
    assertFalse(
      Quantity.equalsWithin(
        Length.meters(1),
        Length.meters(1.002),
        Length.millimeters(1),
      ),
    );
  });

  it("is false for NaN", () => {
    assertFalse(
      Quantity.equalsWithin(
        Quantity.make("Meters", NaN),
        Length.meters(1),
        Length.meters(1),
      ),
    );
  });

  it("is reflexive for infinite quantities", () => {
    const infinite = Length.meters(Infinity);

    assertTrue(Quantity.equalsWithin(infinite, infinite, Length.meters(1)));
    assertFalse(
      Quantity.equalsWithin(
        infinite,
        Length.meters(-Infinity),
        Length.meters(1),
      ),
    );
  });
});

describe("equalsWithinRelative", () => {
  it("compares the difference against the mean magnitude", () => {
    assertTrue(
      Quantity.equalsWithinRelative(
        Length.meters(100),
        Length.meters(101),
        Dimensionless.percent(1),
      ),
    );
    assertFalse(
      Quantity.equalsWithinRelative(
        Length.meters(100),
        Length.meters(102),
        Dimensionless.percent(1),
      ),
    );
  });

  it("is symmetric and supports data-last calls", () => {
    const isWithinOnePercent = Quantity.equalsWithinRelative(
      Length.meters(101),
      Dimensionless.percent(1),
    );

    expectTypeOf(isWithinOnePercent).toEqualTypeOf<
      (a: Quantity.Quantity<Length.Meters>) => boolean
    >();
    assertTrue(isWithinOnePercent(Length.meters(100)));
    assertTrue(
      Quantity.equalsWithinRelative(
        Length.meters(101),
        Length.meters(100),
        Dimensionless.percent(1),
      ),
    );

    if (globalThis.Boolean(false)) {
      Quantity.equalsWithinRelative(
        Length.meters(100),
        Length.meters(101),
        // @ts-expect-error Relative tolerance must be unitless.
        Length.meters(1),
      );
      Quantity.equalsWithinRelative(
        Length.meters(100),
        // @ts-expect-error The compared quantities must have the same unit.
        Mass.kilograms(100),
        Dimensionless.percent(1),
      );
    }
  });

  it("handles zero magnitudes", () => {
    assertTrue(
      Quantity.equalsWithinRelative(
        Length.zero,
        Length.zero,
        Dimensionless.fraction(0),
      ),
    );
    assertFalse(
      Quantity.equalsWithinRelative(
        Length.zero,
        Length.meters(1),
        Dimensionless.fraction(1.99),
      ),
    );
    assertTrue(
      Quantity.equalsWithinRelative(
        Length.zero,
        Length.meters(1),
        Dimensionless.fraction(2),
      ),
    );
  });

  it("avoids overflow and underflow at finite extremes", () => {
    const tolerance = Dimensionless.fraction(2);

    assertTrue(
      Quantity.equalsWithinRelative(
        Length.zero,
        Length.meters(Number.MIN_VALUE),
        tolerance,
      ),
    );
    assertTrue(
      Quantity.equalsWithinRelative(
        Length.meters(Number.MAX_VALUE),
        Length.meters(-Number.MAX_VALUE),
        tolerance,
      ),
    );
  });

  it("is false for NaN and unequal infinities", () => {
    const infinite = Length.meters(Infinity);
    const tolerance = Dimensionless.percent(1);

    assertFalse(
      Quantity.equalsWithinRelative(
        Quantity.make("Meters", NaN),
        Length.meters(1),
        tolerance,
      ),
    );
    assertTrue(Quantity.equalsWithinRelative(infinite, infinite, tolerance));
    assertFalse(
      Quantity.equalsWithinRelative(
        infinite,
        Length.meters(-Infinity),
        tolerance,
      ),
    );
    assertFalse(
      Quantity.equalsWithinRelative(infinite, Length.meters(1), tolerance),
    );
  });
});

describe("comparison", () => {
  it("orders quantities", () => {
    const short = Length.meters(1);
    const long = Length.meters(2);

    assertTrue(Quantity.isLessThan(short, long));
    assertTrue(Quantity.isLessThanOrEqualTo(short, short));
    assertTrue(Quantity.isGreaterThan(long, short));
    assertTrue(Quantity.isGreaterThanOrEqualTo(long, long));
    assertTrue(Equal.equals(Quantity.min(short, long), short));
    assertTrue(Equal.equals(Quantity.max(short, long), long));
  });

  it("comparisons involving NaN are false", () => {
    const nan = Quantity.make("Meters", NaN);

    assertFalse(Quantity.isLessThan(nan, Length.meters(1)));
    assertFalse(Quantity.isGreaterThan(nan, Length.meters(1)));
    assertFalse(Quantity.isLessThanOrEqualTo(nan, nan));
  });

  it("min and max propagate NaN regardless of argument order", () => {
    const nan = Quantity.make("Meters", NaN);
    const five = Length.meters(5);

    assertTrue(Number.isNaN(Quantity.min(nan, five).value));
    assertTrue(Number.isNaN(Quantity.min(five, nan).value));
    assertTrue(Number.isNaN(Quantity.max(nan, five).value));
    assertTrue(Number.isNaN(Quantity.max(five, nan).value));
  });
});

describe("inspection", () => {
  it("formats via Inspectable", () => {
    const speed = Quantity.make(Unit.rate(Length.Meters, "Seconds"), 5);

    deepStrictEqual(speed.toJSON(), {
      _id: "Quantity",
      unit: "(Meters/Seconds)",
      value: 5,
    });
    assertEquals(
      speed.toString(),
      '{"_id":"Quantity","unit":"(Meters/Seconds)","value":5}',
    );
  });
});
