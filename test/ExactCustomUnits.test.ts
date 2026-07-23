import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import type * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as ExactLength from "../src/ExactLength.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
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

type Money = ExactQuantity.ExactQuantity<Usd>;
const Money = ExactQuantity.ExactQuantity(Usd);

const make = (value: Rational.Rational): Money =>
  ExactQuantity.make(Usd, value);

const cents = (r: Rational.Rational): Money => make(r);
const inCents = (m: Money): Rational.Rational => m.value;
const dollars = (r: Rational.Rational): Money =>
  make(Rational.multiply(r, Rational.make(100n)));
const inDollars = (m: Money): Rational.Rational =>
  Rational.unsafeDivide(m.value, Rational.make(100n));

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
        ? Rational.make(10n ** BigInt(scale - USD.exponent))
        : Rational.make(1n, 10n ** BigInt(USD.exponent - scale)),
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
      Rational.make(BigInt(snapshot.amount)),
      snapshot.scale >= USD.exponent
        ? Rational.make(1n, 10n ** BigInt(snapshot.scale - USD.exponent))
        : Rational.make(10n ** BigInt(USD.exponent - snapshot.scale)),
    ),
  );
};

describe("exact custom units (a consumer-authored USD module)", () => {
  it("keeps a USD/meter rate exact — the headline contrast with floats", () => {
    // $2 over 3 meters is exactly 200/3 cents per meter. The float example
    // needs isCloseTo here; this is Equal.equals.
    const pricePerMeter = ExactQuantity.per(
      dollars(Rational.make(2n)),
      ExactLength.meters(Rational.make(3n)),
    );

    assertTrue(Option.isSome(pricePerMeter));
    const rate = Option.getOrThrow(pricePerMeter);

    assertTrue(Unit.equals(rate.unit, Unit.rate(Usd, "Meters")));
    assertTrue(Equal.equals(rate.value, Rational.make(200n, 3n)));

    // Applying the rate back to 3 meters recovers exactly $2 — no lost cent.
    assertTrue(
      Equal.equals(
        ExactQuantity.at(rate, ExactLength.meters(Rational.make(3n))),
        dollars(Rational.make(2n)),
      ),
    );
  });

  it("per of a zero length is None, not Infinity", () => {
    assertTrue(
      Option.isNone(ExactQuantity.per(dollars(Rational.one), ExactLength.zero)),
    );
  });

  it("rounds exactly once at the dinero boundary", () => {
    const rate = ExactQuantity.unsafePer(
      dollars(Rational.make(2n)),
      ExactLength.meters(Rational.make(3n)),
    );
    const cost = ExactQuantity.at(rate, ExactLength.meters(Rational.one));

    assertTrue(Equal.equals(inCents(cost), Rational.make(200n, 3n)));
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
    const money = dollars(Rational.make(9n, 2n));

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
        cents(Rational.make(450n)),
      ),
    );
  });

  it("rejects amounts outside the dinero-safe integer range", () => {
    throws(() => toDinero(cents(Rational.make(2n ** 53n)), 2, "half-even"));
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
    const exact = ExactQuantity.unsafeFromQuantity(floatMoney);

    assertTrue(Equal.equals(exact, cents(Rational.make(450n))));
    assertTrue(Equal.equals(ExactQuantity.unsafeToQuantity(exact), floatMoney));
  });

  it("roundtrips through the schema, freezing the wire format", () => {
    const thirds = cents(Rational.make(200n, 3n));
    const encoded = Schema.encodeSync(Money)(thirds);

    deepStrictEqual(encoded, { unit: "[USD]", value: "200/3" });
    assertTrue(Equal.equals(Schema.decodeSync(Money)(encoded), thirds));
  });

  it("supports sub-cent bookkeeping without drift", () => {
    // Summing thirds of a cent 300 times is exactly one dollar — floats
    // would have accumulated error; rationals cannot.
    let total = cents(Rational.zero);
    for (let i = 0; i < 300; i++) {
      total = ExactQuantity.sum(total, cents(Rational.make(1n, 3n)));
    }

    assertTrue(Equal.equals(total, dollars(Rational.one)));
    assertEquals(inDollars(total).numerator, 1n);
  });
});
