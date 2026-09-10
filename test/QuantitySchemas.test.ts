import { describe, expect, expectTypeOf, it } from "@effect/vitest";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";
import * as FastCheck from "effect/testing/FastCheck";

import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Unit from "../src/Unit.ts";

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
    expect(Schema.encodeSync(json)({ count: count(2) })).toEqual({ count: 2 });
    expect(Schema.decodeUnknownSync(json)({ count: 2 }).count.value).toBe(2);
    const canonical = Schema.toCodecJson(Quantity.Quantity(Count));
    expect(Schema.encodeSync(canonical)(count(2))).toEqual({
      unit: "[Count]",
      value: 2,
    });
  });

  it("normalizes negative zero", () => {
    const codec = Quantity.QuantityFromValue(Count);
    expect(Object.is(Schema.decodeUnknownSync(codec)(-0).value, 0)).toBe(true);
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
        Schema.decodeUnknownSync(nonNegative)({ unit: "[Count]", value }).value,
      ).toBe(value === 0 ? 0 : value);
    }
    expect(Result.isFailure(Schema.encodeResult(nonNegative)(count(-1)))).toBe(
      true,
    );
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
    expect(Result.isFailure(Schema.decodeUnknownResult(checked)(2))).toBe(true);
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
        Result.isFailure(Schema.encodeResult(json)({ count: count(Infinity) })),
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
    expect(Result.isFailure(Schema.encodeResult(codec)(count(1.5)))).toBe(true);
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

  it("runs the README's bare-value and existing-codec recipes", () => {
    const PositiveMeters = Quantity.positive(
      Quantity.QuantityFromValue("Meters"),
    );
    const NonNegativeLength = Quantity.nonNegative(Length.LengthFromStruct);
    const AtLeastOneMeter = PositiveMeters.check(
      Quantity.greaterThanOrEqualTo(Length.meters(1)),
    );
    expect(
      Quantity.equals(Schema.decodeSync(AtLeastOneMeter)(2), Length.meters(2)),
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
