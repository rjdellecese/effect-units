import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Length from "./Length";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";
import * as Unit from "./Unit";

const bigDecimal = Arbitrary.make(Schema.BigDecimal);
const nonZeroBigDecimal = bigDecimal.filter(
  (n) => !BigDecimal.isZero(BigDecimal.normalize(n)),
);

describe("multiply", () => {
  const baseQuantities = [
    { label: "Length", constructor: Length.meters },
    { label: "Mass", constructor: Mass.kilograms },
  ];

  baseQuantities.forEach((baseQuantity) => {
    it(`BigDecimal * Quantity (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(bigDecimal, bigDecimal, (a, b) => {
          const quantityProduct = Quantity.multiply(
            baseQuantity.constructor(a),
            b,
          );
          const bigDecimalProduct = BigDecimal.multiply(a, b);

          assertEquals(quantityProduct.value, bigDecimalProduct);
        }),
      );
    });

    it(`Quantity * BigDecimal (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(bigDecimal, bigDecimal, (a, b) => {
          const quantityProduct = Quantity.multiply(
            a,
            baseQuantity.constructor(b),
          );
          const bigDecimalProduct = BigDecimal.multiply(a, b);

          assertEquals(quantityProduct.value, bigDecimalProduct);
        }),
      );
    });
  });
});

describe("times", () => {
  it("multiplies values and forms a Product unit", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, bigDecimal, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));

        assertEquals(product.value, BigDecimal.multiply(a, b));
        assertTrue(
          Unit.equals(
            product.unit,
            Unit.product(Length.Meters, Mass.Kilograms),
          ),
        );
      }),
    );
  });

  it("over recovers the left factor exactly", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, nonZeroBigDecimal, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));
        const recovered = Quantity.over(product, Mass.kilograms(b));

        assertTrue(Option.isSome(recovered));
        assertTrue(Equal.equals(Option.getOrThrow(recovered), Length.meters(a)));
      }),
    );
  });

  it("over_ recovers the right factor exactly", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroBigDecimal, bigDecimal, (a, b) => {
        const product = Quantity.times(Length.meters(a), Mass.kilograms(b));
        const recovered = Quantity.over_(product, Length.meters(a));

        assertTrue(Option.isSome(recovered));
        assertTrue(Equal.equals(Option.getOrThrow(recovered), Mass.kilograms(b)));
      }),
    );
  });
});

describe("squared / cubed", () => {
  it("squared multiplies a quantity by itself", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, (a) => {
        const squared = Quantity.squared(Length.meters(a));

        assertEquals(squared.value, BigDecimal.multiply(a, a));
        assertTrue(Unit.equals(squared.unit, Unit.squared(Length.Meters)));
      }),
    );
  });

  it("cubed multiplies a quantity by itself twice", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, (a) => {
        const cubed = Quantity.cubed(Length.meters(a));

        assertEquals(
          cubed.value,
          BigDecimal.multiply(BigDecimal.multiply(a, a), a),
        );
        assertTrue(Unit.equals(cubed.unit, Unit.cubed(Length.Meters)));
      }),
    );
  });
});

describe("rates", () => {
  const seconds = (n: BigDecimal.BigDecimal) => Quantity.make("Seconds", n);

  it("per divides values and forms a Rate unit", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, nonZeroBigDecimal, (a, b) => {
        const rate = Quantity.unsafePer(Length.meters(a), seconds(b));

        assertEquals(rate.value, BigDecimal.unsafeDivide(a, b));
        assertTrue(
          Unit.equals(rate.unit, Unit.rate(Length.Meters, "Seconds")),
        );
      }),
    );
  });

  it("per is none for a zero divisor", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, (a) => {
        const rate = Quantity.per(
          Length.meters(a),
          seconds(BigDecimal.fromBigInt(0n)),
        );

        assertTrue(Option.isNone(rate));
      }),
    );
  });

  it("at multiplies a rate by an independent quantity", () => {
    // Compile-time inference check: `at` on a Rate<"Meters", "Seconds">
    // quantity infers Quantity<"Meters">.
    const inferred: Quantity.Quantity<Length.Meters> = Quantity.at(
      Quantity.make(
        Unit.rate(Length.Meters, "Seconds"),
        BigDecimal.fromBigInt(1n),
      ),
      seconds(BigDecimal.fromBigInt(1n)),
    );
    assertEquals(inferred.value, BigDecimal.fromBigInt(1n));

    FastCheck.assert(
      FastCheck.property(bigDecimal, bigDecimal, (r, i) => {
        const rate = Quantity.make(
          Unit.rate(Length.Meters, "Seconds"),
          r,
        );
        const dependent = Quantity.at(rate, seconds(i));

        assertEquals(dependent.value, BigDecimal.multiply(r, i));
        assertTrue(Unit.equals(dependent.unit, Length.Meters));
      }),
    );
  });

  it("for_ matches at with flipped arguments", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, bigDecimal, (r, i) => {
        const rate = Quantity.make(
          Unit.rate(Length.Meters, "Seconds"),
          r,
        );

        assertTrue(
          Equal.equals(
            Quantity.for_(seconds(i), rate),
            Quantity.at(rate, seconds(i)),
          ),
        );
      }),
    );
  });

  it("at_ inverts at exactly", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroBigDecimal, bigDecimal, (r, i) => {
        const rate = Quantity.make(
          Unit.rate(Length.Meters, "Seconds"),
          r,
        );
        const dependent = Quantity.at(rate, seconds(i));
        const recovered = Quantity.at_(dependent, rate);

        assertTrue(Option.isSome(recovered));
        assertTrue(Equal.equals(Option.getOrThrow(recovered), seconds(i)));
      }),
    );
  });
});

describe("exactness", () => {
  // Validates the library-wide conversion-factor convention: multiplying by a
  // fixed high-precision constant and dividing by the same constant roundtrips
  // exactly, because the quotient terminates.
  it("multiply-then-divide by a 100-digit constant roundtrips exactly", () => {
    const k = BigDecimal.unsafeDivide(
      BigDecimal.fromBigInt(1n),
      BigDecimal.fromBigInt(3n),
    );

    FastCheck.assert(
      FastCheck.property(bigDecimal, (n) => {
        const roundTripped = BigDecimal.unsafeDivide(
          BigDecimal.multiply(n, k),
          k,
        );

        assertEquals(roundTripped, n);
      }),
    );
  });
});

describe("schema", () => {
  it("encodes and decodes a base-unit quantity", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, (n) => {
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

    const quantity = Quantity.make(MetersPerSecond, BigDecimal.fromBigInt(1n));
    const encoded = Schema.encodeSync(Speed)(quantity);

    deepStrictEqual(encoded, { unit: "(Meters/Seconds)", value: "1" });
    assertTrue(Equal.equals(Schema.decodeSync(Speed)(encoded), quantity));
  });
});

describe("equals", () => {
  it("compares structurally equal units", () => {
    const a = Quantity.make(
      Unit.rate(Length.Meters, "Seconds"),
      BigDecimal.fromBigInt(1n),
    );
    const b = Quantity.make(
      Unit.rate(Length.Meters, "Seconds"),
      BigDecimal.fromBigInt(1n),
    );

    assertTrue(Equal.equals(a, b));
  });

  it("distinguishes different units", () => {
    const a = Quantity.make("Meters", BigDecimal.fromBigInt(1n));
    const b = Quantity.make("Seconds", BigDecimal.fromBigInt(1n));

    assertTrue(!Equal.equals(a, b));
  });
});
