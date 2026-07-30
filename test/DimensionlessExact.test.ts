import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Schema from "effect/Schema";

import * as Dimensionless from "../src/Dimensionless.ts";
import * as DimensionlessExact from "../src/DimensionlessExact.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as Rational from "../src/Rational.ts";
import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";

describe("DimensionlessExact", () => {
  testExactRoundtrips([
    [DimensionlessExact.fraction, DimensionlessExact.inFraction],
    [DimensionlessExact.percent, DimensionlessExact.inPercent],
    [DimensionlessExact.perMille, DimensionlessExact.inPerMille],
    [DimensionlessExact.basisPoints, DimensionlessExact.inBasisPoints],
    [DimensionlessExact.partsPerMillion, DimensionlessExact.inPartsPerMillion],
    [DimensionlessExact.partsPerBillion, DimensionlessExact.inPartsPerBillion],
  ]);

  testExactAnchors(DimensionlessExact.inFraction, [
    [DimensionlessExact.percent, Rational.makeUnsafe(1n, 100n)],
    [DimensionlessExact.perMille, Rational.makeUnsafe(1n, 1000n)],
    [DimensionlessExact.basisPoints, Rational.makeUnsafe(1n, 10n ** 4n)],
    [DimensionlessExact.partsPerMillion, Rational.makeUnsafe(1n, 10n ** 6n)],
    [DimensionlessExact.partsPerBillion, Rational.makeUnsafe(1n, 10n ** 9n)],
  ]);

  it("relates the scales exactly", () => {
    assertTrue(
      Equal.equals(
        DimensionlessExact.inPercent(DimensionlessExact.one),
        Rational.makeUnsafe(100n),
      ),
    );
    assertTrue(
      Equal.equals(
        DimensionlessExact.inBasisPoints(
          DimensionlessExact.percent(Rational.one),
        ),
        Rational.makeUnsafe(100n),
      ),
    );
    assertTrue(
      Equal.equals(
        DimensionlessExact.inPerMille(DimensionlessExact.percent(Rational.one)),
        Rational.makeUnsafe(10n),
      ),
    );
  });

  it("complement is the rest of the whole, exactly", () => {
    const third = DimensionlessExact.fraction(Rational.makeUnsafe(1n, 3n));

    assertTrue(
      Equal.equals(
        DimensionlessExact.inFraction(DimensionlessExact.complement(third)),
        Rational.makeUnsafe(2n, 3n),
      ),
    );
  });

  // The reason for an exact track here: a third of a whole is 1/3, not
  // 0.3333333333333333, so splitting and recombining loses nothing.
  it("splits a quantity into thirds that add back up", () => {
    const third = QuantityExact.ratioUnsafe(
      LengthExact.meters(Rational.one),
      LengthExact.meters(Rational.makeUnsafe(3n)),
    );
    const whole = LengthExact.meters(Rational.makeUnsafe(3n));
    const part = QuantityExact.times(whole, third);

    assertTrue(Equal.equals(part, LengthExact.meters(Rational.one)));
    assertTrue(
      Equal.equals(
        QuantityExact.sum(QuantityExact.sum(part, part), part),
        whole,
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [DimensionlessExact.percent, Dimensionless.percent],
      [DimensionlessExact.perMille, Dimensionless.perMille],
      [DimensionlessExact.basisPoints, Dimensionless.basisPoints],
      [DimensionlessExact.partsPerMillion, Dimensionless.partsPerMillion],
      [DimensionlessExact.partsPerBillion, Dimensionless.partsPerBillion],
    ] as const) {
      assertEquals(
        Rational.toNumberUnsafe(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });

  describe("schema", () => {
    it("encodes and decodes the wire format", () => {
      const third = DimensionlessExact.fraction(Rational.makeUnsafe(1n, 3n));
      const encoded = Schema.encodeSync(
        DimensionlessExact.DimensionlessExactFromStruct,
      )(third);

      deepStrictEqual(encoded, { unit: "Unitless", value: "1/3" });
      assertTrue(
        Equal.equals(
          Schema.decodeSync(DimensionlessExact.DimensionlessExactFromStruct)(
            encoded,
          ),
          third,
        ),
      );
    });
  });
});
