import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Unit from "../src/Unit.ts";

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = Quantity.Quantity<Usd>;
const MoneyFromStruct = Quantity.QuantityFromStruct(Usd);

const cents = (n: number): Money => {
  if (!Number.isSafeInteger(n)) {
    throw new RangeError("Expected safe integer cents");
  }
  return Quantity.make(Usd, n);
};
const dollars = (n: number): Money => {
  if (!Number.isSafeInteger(n)) {
    throw new RangeError(
      "Expected whole dollars; use cents for fractional dollars",
    );
  }
  return cents(n * 100);
};
const inCents = (m: Money): number => {
  if (!Number.isSafeInteger(m.value)) {
    throw new RangeError("Expected safe integer cents");
  }
  return m.value;
};
const inDollars = (m: Money): number => m.value / 100;

describe("README custom-unit recipes", () => {
  it("renames a binding and type alias without changing stored identity", () => {
    type Units = Unit.Custom<"Units">;
    const Units: Units = Unit.custom("Units");
    const stored = Schema.encodeSync(Quantity.QuantityFromStruct(Units))(
      Quantity.make(Units, 3),
    );

    type Count = Unit.Custom<"Units">;
    const Count: Count = Unit.custom("Units");
    const CountFromStruct = Quantity.QuantityFromStruct(Count);
    const count = Schema.decodeSync(CountFromStruct)(stored);

    assertTrue(Equal.equals(count, Quantity.make(Count, 3)));
    deepStrictEqual(Schema.encodeSync(CountFromStruct)(count), {
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

  it("persists custom IDs in derived rates and products too", () => {
    const Units = Unit.custom("Units");
    const Count = Unit.custom("Units");
    for (const [before, after, changed, wire] of [
      [
        Unit.rate(Usd, Units),
        Unit.rate(Usd, Count),
        Unit.rate(Usd, Unit.custom("Count")),
        "([USD]/[Units])",
      ],
      [
        Unit.product(Units, "Meters"),
        Unit.product(Count, "Meters"),
        Unit.product(Unit.custom("Count"), "Meters"),
        "([Units]*Meters)",
      ],
    ] as const) {
      const stored = Schema.encodeSync(Quantity.QuantityFromStruct(before))(
        Quantity.make(before, 2),
      );
      deepStrictEqual(stored, { unit: wire, value: 2 });
      assertEquals(
        Schema.decodeSync(Quantity.QuantityFromStruct(after))(stored).value,
        2,
      );
      assertTrue(
        Result.isFailure(
          Schema.decodeUnknownResult(Quantity.QuantityFromStruct(changed))(
            stored,
          ),
        ),
      );
    }
  });

  it("composes cents-backed prices and persists cents without scaling", () => {
    const pricePerMeter = Quantity.per(dollars(3), Length.meters(2));
    const cost = Quantity.at(pricePerMeter, Length.meters(10));

    assertEquals(inCents(cost), 1500);
    assertEquals(inDollars(cost), 15);
    assertEquals(inDollars(cents(425)), 4.25);
    deepStrictEqual(Schema.encodeSync(MoneyFromStruct)(cost), {
      unit: "[USD]",
      value: 1500,
    });
  });

  it("accepts both safe-integer limits and rejects invalid boundaries", () => {
    for (const n of [
      0,
      -425,
      Number.MAX_SAFE_INTEGER,
      -Number.MAX_SAFE_INTEGER,
    ]) {
      assertEquals(inCents(cents(n)), n);
    }
    for (const n of [
      0.5,
      Number.MAX_SAFE_INTEGER + 1,
      -Number.MAX_SAFE_INTEGER - 1,
      NaN,
      Infinity,
      -Infinity,
    ]) {
      throws(() => cents(n));
      throws(() => inCents(Quantity.make(Usd, n)));
    }
    throws(() => dollars(4.25));
    throws(() => dollars(Number.MAX_SAFE_INTEGER));
    assertEquals(inCents(dollars(-3)), -300);
  });

  it("checks decoded values because the wire codec has no cents invariant", () => {
    for (const value of [0.5, Number.MAX_SAFE_INTEGER + 1]) {
      const decoded = Schema.decodeSync(MoneyFromStruct)({
        unit: "[USD]",
        value,
      });
      throws(() => inCents(decoded));
    }
  });

  it("rejects fractional or unsafe results despite safe-integer inputs", () => {
    const fractional = Quantity.at(
      Quantity.per(cents(200), Length.meters(3)),
      Length.meters(1),
    );
    assertEquals(fractional.value, 200 / 3);
    throws(() => inCents(fractional));
    throws(() => inCents(Quantity.multiply(cents(Number.MAX_SAFE_INTEGER), 2)));
  });
});
