import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Array from "effect/Array";
import * as Either from "effect/Either";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import * as Schema from "effect/Schema";
import * as String from "effect/String";

import { isCloseTo, double } from "../test/testUtils.js";
import * as Length from "./Length.js";
import * as Mass from "./Mass.js";
import * as Quantity from "./Quantity.js";
import * as Unit from "./Unit.js";

const nonZeroDouble = double.filter((n) => n !== 0);

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

describe("squared / cubed", () => {
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

describe("schema", () => {
  it("encodes and decodes a base-unit quantity", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        const quantity = Length.meters(n);
        const encoded = Schema.encodeSync(Length.Length)(quantity);
        const decoded = Schema.decodeSync(Length.Length)(encoded);

        assertEquals(encoded.unit, "Meters");
        assertTrue(Equal.equals(decoded, quantity));
      }),
    );
  });

  it("encodes and decodes a rate quantity, freezing the wire format", () => {
    const MetersPerSecond = Unit.rate(Length.Meters, "Seconds");
    const Speed = Quantity.Quantity(MetersPerSecond);

    const quantity = Quantity.make(MetersPerSecond, 1);
    const encoded = Schema.encodeSync(Speed)(quantity);

    deepStrictEqual(encoded, { unit: "(Meters/Seconds)", value: 1 });
    assertTrue(Equal.equals(Schema.decodeSync(Speed)(encoded), quantity));
  });

  it("rejects non-finite values at the wire boundary", () => {
    // In-memory arithmetic produces Infinity/NaN by design, but JSON would
    // silently turn them into null — so encoding must fail loudly instead.
    const MetersPerSecond = Unit.rate(Length.Meters, "Seconds");
    const Speed = Quantity.Quantity(MetersPerSecond);
    const infinite = Quantity.per(
      Length.meters(1),
      Quantity.make("Seconds", 0),
    );

    assertTrue(Either.isLeft(Schema.encodeEither(Speed)(infinite)));
    assertTrue(
      Either.isLeft(
        Schema.decodeUnknownEither(Speed)({
          unit: "(Meters/Seconds)",
          value: null,
        }),
      ),
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

    assertTrue(Quantity.lessThan(short, long));
    assertTrue(Quantity.lessThanOrEqualTo(short, short));
    assertTrue(Quantity.greaterThan(long, short));
    assertTrue(Quantity.greaterThanOrEqualTo(long, long));
    assertTrue(Equal.equals(Quantity.min(short, long), short));
    assertTrue(Equal.equals(Quantity.max(short, long), long));
  });

  it("comparisons involving NaN are false", () => {
    const nan = Quantity.make("Meters", NaN);

    assertFalse(Quantity.lessThan(nan, Length.meters(1)));
    assertFalse(Quantity.greaterThan(nan, Length.meters(1)));
    assertFalse(Quantity.lessThanOrEqualTo(nan, nan));
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
    assertTrue(String.includes('"unit": "(Meters/Seconds)"')(speed.toString()));
  });
});
