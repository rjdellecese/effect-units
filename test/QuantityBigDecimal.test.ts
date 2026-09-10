import { describe, expect, expectTypeOf, it } from "@effect/vitest";
import * as BigDecimal from "effect/BigDecimal";
import * as Option from "effect/Option";
import * as FastCheck from "effect/testing/FastCheck";

import * as Quantity from "../src/Quantity.ts";
import * as Unit from "../src/Unit.ts";

describe("BigDecimal crossings", () => {
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

  it("documents range limits and precision beyond the guarantee", () => {
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

  it("runs the README's decimal-boundary recipe", () => {
    const Usd = Unit.custom("USD");
    const input = BigDecimal.fromStringUnsafe("4.25");
    const amount = Quantity.fromBigDecimal(
      Usd,
      BigDecimal.make(input.value, input.scale - 2),
    );
    if (!Number.isSafeInteger(amount.value)) {
      throw new RangeError("Expected safe integer cents");
    }
    const output = Quantity.toBigDecimal(amount).pipe(
      Option.map((bd) => BigDecimal.make(bd.value, bd.scale + 2)),
    );
    expect(amount.value).toBe(425);
    expect(BigDecimal.equals(Option.getOrThrow(output), input)).toBe(true);
  });
});
