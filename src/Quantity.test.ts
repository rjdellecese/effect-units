import { describe, it } from "@effect/vitest";
import { assertEquals } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as FastCheck from "effect/FastCheck";
import * as Schema from "effect/Schema";

import * as Length from "./Length";
import * as Mass from "./Mass";
import * as Quantity from "./Quantity";

describe("multiply", () => {
  const baseQuantities = [
    { label: "Length", constructor: Length.meters },
    { label: "Mass", constructor: Mass.grams },
  ];

  baseQuantities.forEach((baseQuantity) => {
    it(`BigDecimal * Quantity (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(
          Arbitrary.make(Schema.BigDecimal),
          Arbitrary.make(Schema.BigDecimal),
          (a, b) => {
            const quantityProduct = Quantity.multiply(
              baseQuantity.constructor(a),
              b,
            );
            const bigDecimalProduct = BigDecimal.multiply(a, b);

            assertEquals(quantityProduct.value, bigDecimalProduct);
          },
        ),
      );
    });

    it(`Quantity * BigDecimal (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(
          Arbitrary.make(Schema.BigDecimal),
          Arbitrary.make(Schema.BigDecimal),
          (a, b) => {
            const quantityProduct = Quantity.multiply(
              a,
              baseQuantity.constructor(b),
            );
            const bigDecimalProduct = BigDecimal.multiply(a, b);

            assertEquals(quantityProduct.value, bigDecimalProduct);
          },
        ),
      );
    });

    it(`Quantity * Quantity (${baseQuantity.label})`, () => {
      FastCheck.assert(
        FastCheck.property(
          Arbitrary.make(Schema.BigDecimal),
          Arbitrary.make(Schema.BigDecimal),
          (a, b) => {
            const quantityProduct = Quantity.multiply(
              baseQuantity.constructor(a),
              baseQuantity.constructor(b),
            );
            const bigDecimalProduct = BigDecimal.multiply(a, b);

            assertEquals(quantityProduct.value, bigDecimalProduct);
          },
        ),
      );
    });
  });
});
