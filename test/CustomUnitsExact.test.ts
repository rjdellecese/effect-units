import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as Array from "effect/Array";
import type * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as LengthExact from "../src/LengthExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Rational from "../src/Rational.ts";
import * as Unit from "../src/Unit.ts";

// The exact counterpart of test/CustomUnits.test.ts: a consumer-authored
// Money module over a custom base unit, with Rational values. Where the
// float example needs isCloseTo and a rounding policy inside the rate
// algebra, everything here is exact until the single explicit rounding at
// the dinero boundary.

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = QuantityExact.QuantityExact<Usd>;
const Money = QuantityExact.QuantityExact(Usd);

const make = (value: Rational.Rational): Money =>
  QuantityExact.make(Usd, value);

const cents = (r: Rational.Rational): Money => make(r);
const inCents = (m: Money): Rational.Rational => m.value;
const dollars = (r: Rational.Rational): Money =>
  make(Rational.multiply(r, Rational.unsafeMake(100n)));
const inDollars = (m: Money): Rational.Rational =>
  Rational.unsafeDivide(m.value, Rational.unsafeMake(100n));

interface DineroSnapshot {
  readonly amount: number;
  readonly currency: {
    readonly code: string;
    readonly base: number;
    readonly exponent: number;
  };
  readonly scale: number;
}

const USD = { code: "USD", base: 10, exponent: 2 } as const;

/**
 * Exactly one rounding, at the boundary, with the mode named at the call
 * site — the value stays a lossless rational until this moment.
 */
const toDinero = (
  m: Money,
  scale: number,
  mode: BigDecimal.RoundingMode,
): DineroSnapshot => {
  const amount = Rational.round(
    Rational.multiply(
      m.value,
      scale >= USD.exponent
        ? Rational.unsafeMake(10n ** BigInt(scale - USD.exponent))
        : Rational.unsafeMake(1n, 10n ** BigInt(USD.exponent - scale)),
    ),
    { mode },
  );
  if (amount > 9007199254740991n || amount < -9007199254740991n) {
    throw new RangeError(`toDinero: amount ${amount} is not a safe integer`);
  }
  return { amount: Number(amount), currency: USD, scale };
};

const fromDinero = (snapshot: DineroSnapshot): Money => {
  if (!Number.isSafeInteger(snapshot.amount)) {
    throw new RangeError(
      `fromDinero: amount ${snapshot.amount} is not a safe integer`,
    );
  }
  return make(
    Rational.multiply(
      Rational.unsafeMake(BigInt(snapshot.amount)),
      snapshot.scale >= USD.exponent
        ? Rational.unsafeMake(1n, 10n ** BigInt(snapshot.scale - USD.exponent))
        : Rational.unsafeMake(10n ** BigInt(USD.exponent - snapshot.scale)),
    ),
  );
};

describe("exact custom units (a consumer-authored USD module)", () => {
  it("keeps a USD/meter rate exact — the headline contrast with floats", () => {
    // $2 over 3 meters is exactly 200/3 cents per meter. The float example
    // needs isCloseTo here; this is Equal.equals.
    const pricePerMeter = QuantityExact.per(
      dollars(Rational.unsafeMake(2n)),
      LengthExact.meters(Rational.unsafeMake(3n)),
    );

    assertTrue(Option.isSome(pricePerMeter));
    const rate = Option.getOrThrow(pricePerMeter);

    assertTrue(Unit.equals(rate.unit, Unit.rate(Usd, "Meters")));
    assertTrue(Equal.equals(rate.value, Rational.unsafeMake(200n, 3n)));

    // Applying the rate back to 3 meters recovers exactly $2 — no lost cent.
    assertTrue(
      Equal.equals(
        QuantityExact.at(rate, LengthExact.meters(Rational.unsafeMake(3n))),
        dollars(Rational.unsafeMake(2n)),
      ),
    );
  });

  it("per of a zero length is None, not Infinity", () => {
    assertTrue(
      Option.isNone(QuantityExact.per(dollars(Rational.one), LengthExact.zero)),
    );
  });

  it("rounds exactly once at the dinero boundary", () => {
    const rate = QuantityExact.unsafePer(
      dollars(Rational.unsafeMake(2n)),
      LengthExact.meters(Rational.unsafeMake(3n)),
    );
    const cost = QuantityExact.at(rate, LengthExact.meters(Rational.one));

    assertTrue(Equal.equals(inCents(cost), Rational.unsafeMake(200n, 3n)));
    deepStrictEqual(toDinero(cost, 2, "half-even"), {
      amount: 67,
      currency: USD,
      scale: 2,
    });
    deepStrictEqual(toDinero(cost, 4, "half-even"), {
      amount: 6667,
      currency: USD,
      scale: 4,
    });
  });

  it("dinero snapshots roundtrip exactly at any scale", () => {
    const money = dollars(Rational.unsafeMake(9n, 2n));

    deepStrictEqual(toDinero(money, 2, "half-even"), {
      amount: 450,
      currency: USD,
      scale: 2,
    });
    assertTrue(
      Equal.equals(fromDinero(toDinero(money, 2, "half-even")), money),
    );
    assertTrue(
      Equal.equals(
        fromDinero({ amount: 4500, currency: USD, scale: 3 }),
        cents(Rational.unsafeMake(450n)),
      ),
    );
  });

  it("rejects amounts outside the dinero-safe integer range", () => {
    throws(() =>
      toDinero(cents(Rational.unsafeMake(2n ** 53n)), 2, "half-even"),
    );
    throws(() =>
      fromDinero({
        amount: Number.MAX_SAFE_INTEGER + 1,
        currency: USD,
        scale: 2,
      }),
    );
  });

  it("bridges float money exactly", () => {
    const floatMoney = Quantity.make(Usd, 450);
    const exact = QuantityExact.unsafeFromQuantity(floatMoney);

    assertTrue(Equal.equals(exact, cents(Rational.unsafeMake(450n))));
    assertTrue(Equal.equals(QuantityExact.unsafeToQuantity(exact), floatMoney));
  });

  it("roundtrips through the schema, freezing the wire format", () => {
    const thirds = cents(Rational.unsafeMake(200n, 3n));
    const encoded = Schema.encodeSync(Money)(thirds);

    deepStrictEqual(encoded, { unit: "[USD]", value: "200/3" });
    assertTrue(Equal.equals(Schema.decodeSync(Money)(encoded), thirds));
  });

  it("supports sub-cent bookkeeping without drift", () => {
    // Summing thirds of a cent 300 times is exactly one dollar — floats
    // would have accumulated error; rationals cannot.
    const total = Array.reduce(
      Array.makeBy(300, () => cents(Rational.unsafeMake(1n, 3n))),
      cents(Rational.zero),
      (a: Money, b: Money) => QuantityExact.sum(a, b),
    );

    assertTrue(Equal.equals(total, dollars(Rational.one)));
    assertEquals(inDollars(total).numerator, 1n);
  });
});
