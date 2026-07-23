import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Either from "effect/Either";
import * as Equal from "effect/Equal";
import * as Schema from "effect/Schema";

import { isCloseTo } from "./testUtils.ts";
import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Unit from "../src/Unit.ts";

// A consumer-authored Money module built on a custom base unit, following
// the library's module template (compare src/Speed.ts). Values are stored
// in minor units (cents), matching dinero.js's integer-minor-units model.

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = Quantity.Quantity<Usd>;
const Money = Quantity.Quantity(Usd);

const make = (value: number): Money => Quantity.make(Usd, value);

const cents = (n: number): Money => make(n);
const inCents = (m: Money): number => m.value;
const dollars = (n: number): Money => make(n * 100);
const inDollars = (m: Money): number => m.value / 100;

// The structural shape of a dinero.js v2 snapshot ({ amount, currency,
// scale }); dinero itself is intentionally not a dependency — conversion
// happens at the boundary, and the quantity's value stays a number.

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

const toDinero = (m: Money): DineroSnapshot => ({
  amount: m.value,
  currency: USD,
  scale: USD.exponent,
});

const fromDinero = (snapshot: DineroSnapshot): Money =>
  make(snapshot.amount / 10 ** (snapshot.scale - USD.exponent));

describe("custom units (a consumer-authored USD module)", () => {
  it("constructors agree on minor units", () => {
    assertTrue(Equal.equals(dollars(1.5), cents(150)));
    assertEquals(inCents(dollars(1.5)), 150);
    assertEquals(inDollars(cents(150)), 1.5);
  });

  it("per forms a USD/meter rate", () => {
    // Compile-time inference check: Custom<"USD"> satisfies Unit.Unit, and
    // `per` infers the Rate<Usd, Meters> tag.
    const asUnit: Unit.Unit = Usd;
    const pricePerMeter: Quantity.Quantity<Unit.Rate<Usd, Length.Meters>> =
      Quantity.per(dollars(3), Length.meters(2));

    assertTrue(Unit.isUnit(asUnit));
    assertTrue(Unit.equals(pricePerMeter.unit, Unit.rate(Usd, Length.Meters)));
    assertEquals(pricePerMeter.value, 150); // cents per meter
  });

  it("at computes a cost from a rate and a length", () => {
    const pricePerMeter = Quantity.per(dollars(3), Length.meters(2));

    // Compile-time inference check: `at` recovers Quantity<Usd>.
    const cost: Money = Quantity.at(pricePerMeter, Length.meters(10));

    assertEquals(inDollars(cost), 15);
    assertTrue(
      Equal.equals(Quantity.for_(Length.meters(10), pricePerMeter), cost),
    );
  });

  it("at_ recovers the length a budget affords", () => {
    const pricePerMeter = Quantity.per(dollars(3), Length.meters(2));

    // Compile-time inference check: `at_` recovers Quantity<Meters>.
    const affordable: Quantity.Quantity<Length.Meters> = Quantity.at_(
      dollars(15),
      pricePerMeter,
    );

    assertTrue(isCloseTo(Length.inMeters(affordable), 10));
  });

  it("roundtrips through the schema, freezing the wire format", () => {
    const encoded = Schema.encodeSync(Money)(cents(150));

    deepStrictEqual(encoded, { unit: "[USD]", value: 150 });
    assertTrue(Equal.equals(Schema.decodeSync(Money)(encoded), cents(150)));
    assertTrue(
      Either.isLeft(
        Schema.decodeUnknownEither(Money)({ unit: "USD", value: 150 }),
      ),
    );
  });

  it("is distinct from same-named base units", () => {
    assertFalse(Equal.equals(cents(1), Quantity.make("Meters", 1)));
    assertFalse(Unit.equals(Unit.custom("Meters"), "Meters"));
  });

  it("converts to and from dinero snapshots at the boundary", () => {
    deepStrictEqual(toDinero(dollars(4.5)), {
      amount: 450,
      currency: { code: "USD", base: 10, exponent: 2 },
      scale: 2,
    });
    assertTrue(Equal.equals(fromDinero(toDinero(dollars(4.5))), cents(450)));
    // A snapshot at a non-default scale normalizes back to minor units.
    assertTrue(
      Equal.equals(
        fromDinero({ amount: 4500, currency: USD, scale: 3 }),
        cents(450),
      ),
    );
  });
});
