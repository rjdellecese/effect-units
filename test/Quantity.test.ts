import { describe, expectTypeOf, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as Array from "effect/Array";
import * as Result from "effect/Result";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";
import * as Function from "effect/Function";
import * as Schema from "effect/Schema";

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

describe("multiply", () => {
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
