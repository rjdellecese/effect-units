import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  deepStrictEqual,
  throws,
} from "@effect/vitest/utils";
import * as Either from "effect/Either";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { nonZeroRational, rational } from "./testUtilsExact.ts";
import { double } from "./testUtils.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import * as Rational from "../src/Rational.ts";
import * as Unit from "../src/Unit.ts";

const meters = (r: Rational.Rational) => QuantityExact.make("Meters", r);
const seconds = (r: Rational.Rational) => QuantityExact.make("Seconds", r);
const kilograms = (r: Rational.Rational) => QuantityExact.make("Kilograms", r);

describe("arithmetic", () => {
  it("sum and subtract are exact inverses", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, (a, b) => {
        assertTrue(
          Equal.equals(
            QuantityExact.subtract(
              QuantityExact.sum(meters(a), meters(b)),
              meters(b),
            ),
            meters(a),
          ),
        );
      }),
    );
  });

  it("multiply and divide by a scalar are exact inverses", () => {
    FastCheck.assert(
      FastCheck.property(rational, nonZeroRational, (a, s) => {
        const scaled = QuantityExact.multiply(meters(a), s);
        const back = QuantityExact.divide(scaled, s);

        assertTrue(Option.isSome(back));
        assertTrue(Equal.equals(Option.getOrThrow(back), meters(a)));
        assertTrue(Equal.equals(QuantityExact.multiply(s, meters(a)), scaled));
      }),
    );
  });

  it("times and over are exact inverses", () => {
    FastCheck.assert(
      FastCheck.property(rational, nonZeroRational, (a, b) => {
        const product = QuantityExact.times(meters(a), kilograms(b));

        assertTrue(
          Unit.equals(product.unit, Unit.product("Meters", "Kilograms")),
        );

        const left = QuantityExact.over(product, kilograms(b));

        assertTrue(Option.isSome(left));
        assertTrue(Equal.equals(Option.getOrThrow(left), meters(a)));
      }),
    );
  });

  it("over_ recovers the right factor exactly", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroRational, rational, (a, b) => {
        const product = QuantityExact.times(meters(a), kilograms(b));
        const right = QuantityExact.over_(product, meters(a));

        assertTrue(Option.isSome(right));
        assertTrue(Equal.equals(Option.getOrThrow(right), kilograms(b)));
      }),
    );
  });

  it("squared and cubed compose units and values", () => {
    FastCheck.assert(
      FastCheck.property(rational, (a) => {
        const sq = QuantityExact.squared(meters(a));
        const cu = QuantityExact.cubed(meters(a));

        assertTrue(Unit.equals(sq.unit, Unit.squared("Meters")));
        assertTrue(Equal.equals(sq.value, Rational.multiply(a, a)));
        assertTrue(Unit.equals(cu.unit, Unit.cubed("Meters")));
        assertTrue(Equal.equals(cu.value, Rational.multiplyAll([a, a, a])));
      }),
    );
  });
});

describe("rates", () => {
  it("at inverts per exactly", () => {
    FastCheck.assert(
      FastCheck.property(rational, nonZeroRational, (a, b) => {
        const rate = QuantityExact.unsafePer(meters(a), seconds(b));

        assertTrue(Unit.equals(rate.unit, Unit.rate("Meters", "Seconds")));
        assertTrue(Equal.equals(QuantityExact.at(rate, seconds(b)), meters(a)));
      }),
    );
  });

  it("at_ inverts at exactly", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroRational, rational, (r, i) => {
        const rate = QuantityExact.unsafePer(meters(r), seconds(Rational.one));
        const dependent = QuantityExact.at(rate, seconds(i));
        const recovered = QuantityExact.at_(dependent, rate);

        assertTrue(Option.isSome(recovered));
        assertTrue(Equal.equals(Option.getOrThrow(recovered), seconds(i)));
      }),
    );
  });

  it("for_ matches at with flipped arguments", () => {
    FastCheck.assert(
      FastCheck.property(nonZeroRational, rational, (r, i) => {
        const rate = QuantityExact.unsafePer(meters(r), seconds(Rational.one));

        assertTrue(
          Equal.equals(
            QuantityExact.for_(seconds(i), rate),
            QuantityExact.at(rate, seconds(i)),
          ),
        );
      }),
    );
  });

  it("division by zero is None for the whole division family", () => {
    const zeroSeconds = seconds(Rational.zero);
    const one = meters(Rational.one);
    const rate = QuantityExact.unsafePer(one, seconds(Rational.one));
    const zeroRate = QuantityExact.unsafePer(
      meters(Rational.zero),
      seconds(Rational.one),
    );
    const product = QuantityExact.times(one, kilograms(Rational.zero));

    assertTrue(Option.isNone(QuantityExact.per(one, zeroSeconds)));
    assertTrue(Option.isNone(QuantityExact.at_(one, zeroRate)));
    assertTrue(
      Option.isNone(QuantityExact.over(product, kilograms(Rational.zero))),
    );
    assertTrue(
      Option.isNone(QuantityExact.over_(product, meters(Rational.zero))),
    );
    assertTrue(Option.isNone(QuantityExact.divide(one, Rational.zero)));
    assertTrue(Option.isSome(QuantityExact.per(one, seconds(Rational.one))));
    assertTrue(Option.isSome(QuantityExact.at_(one, rate)));
  });

  it("unsafe forms throw on zero divisors", () => {
    const one = meters(Rational.one);
    const zeroRate = QuantityExact.unsafePer(
      meters(Rational.zero),
      seconds(Rational.one),
    );

    throws(() => QuantityExact.unsafePer(one, seconds(Rational.zero)));
    throws(() => QuantityExact.unsafeAt_(one, zeroRate));
    throws(() => QuantityExact.unsafeDivide(one, Rational.zero));
    throws(() =>
      QuantityExact.unsafeOver(
        QuantityExact.times(one, kilograms(Rational.zero)),
        kilograms(Rational.zero),
      ),
    );
  });
});

describe("equality and comparison", () => {
  it("equates equivalent fractions across representations", () => {
    assertTrue(
      Equal.equals(
        meters(Rational.unsafeMake(2n, 4n)),
        meters(Rational.unsafeMake(1n, 2n)),
      ),
    );
    assertFalse(Equal.equals(meters(Rational.one), seconds(Rational.one)));
    assertFalse(Equal.equals(meters(Rational.one), Quantity.make("Meters", 1)));
  });

  it("equalsWithin compares against a rational tolerance", () => {
    assertTrue(
      QuantityExact.equalsWithin(
        meters(Rational.unsafeMake(1n)),
        meters(Rational.unsafeMake(1001n, 1000n)),
        meters(Rational.unsafeMake(1n, 100n)),
      ),
    );
    assertFalse(
      QuantityExact.equalsWithin(
        meters(Rational.unsafeMake(1n)),
        meters(Rational.unsafeMake(102n, 100n)),
        meters(Rational.unsafeMake(1n, 100n)),
      ),
    );
  });

  it("orders quantities totally", () => {
    const short = meters(Rational.unsafeMake(1n, 3n));
    const long = meters(Rational.unsafeMake(1n, 2n));

    assertTrue(QuantityExact.lessThan(short, long));
    assertTrue(QuantityExact.lessThanOrEqualTo(short, short));
    assertTrue(QuantityExact.greaterThan(long, short));
    assertTrue(QuantityExact.greaterThanOrEqualTo(long, long));
    assertTrue(Equal.equals(QuantityExact.min(short, long), short));
    assertTrue(Equal.equals(QuantityExact.max(short, long), long));
  });

  it("agrees with the float module's comparisons on shared values", () => {
    FastCheck.assert(
      FastCheck.property(double, double, (x, y) => {
        assertEquals(
          QuantityExact.lessThan(
            meters(Rational.unsafeFromNumber(x)),
            meters(Rational.unsafeFromNumber(y)),
          ),
          x < y,
        );
      }),
    );
  });
});

describe("interop with the float module", () => {
  it("fromQuantity then toQuantity is the identity on finite quantities", () => {
    FastCheck.assert(
      FastCheck.property(double, (x) => {
        const q = Quantity.make("Meters", x);

        assertTrue(
          Equal.equals(
            QuantityExact.unsafeToQuantity(QuantityExact.unsafeFromQuantity(q)),
            q,
          ),
        );
      }),
    );
  });

  it("fromQuantity is None on NaN and infinities", () => {
    assertTrue(
      Option.isNone(QuantityExact.fromQuantity(Quantity.make("Meters", NaN))),
    );
    assertTrue(
      Option.isNone(
        QuantityExact.fromQuantity(Quantity.make("Meters", Infinity)),
      ),
    );
    throws(() =>
      QuantityExact.unsafeFromQuantity(Quantity.make("Meters", NaN)),
    );
  });

  it("toQuantity rounds a non-dyadic value once, correctly", () => {
    const third = meters(Rational.unsafeMake(1n, 3n));

    assertEquals(QuantityExact.unsafeToQuantity(third).value, 1 / 3);
    assertTrue(
      Option.isNone(
        QuantityExact.toQuantity(meters(Rational.unsafeMake(2n ** 1024n))),
      ),
    );
  });

  it("bridges float unit modules through their tags", () => {
    const exact = QuantityExact.unsafeFromQuantity(Length.meters(1.5));

    assertTrue(Unit.equals(exact.unit, Length.Meters));
    assertTrue(Equal.equals(exact.value, Rational.unsafeMake(3n, 2n)));
  });
});

describe("schema", () => {
  const Meters = QuantityExact.QuantityExact("Meters");

  it("roundtrips, freezing the wire format", () => {
    const q = meters(Rational.unsafeMake(3n, 2n));
    const encoded = Schema.encodeSync(Meters)(q);

    deepStrictEqual(encoded, { unit: "Meters", value: "3/2" });
    assertTrue(Equal.equals(Schema.decodeSync(Meters)(encoded), q));

    const integral = Schema.encodeSync(Meters)(meters(Rational.unsafeMake(3n)));

    deepStrictEqual(integral, { unit: "Meters", value: "3" });
  });

  it("rejects malformed values and wrong units", () => {
    assertTrue(
      Either.isLeft(
        Schema.decodeUnknownEither(Meters)({ unit: "Meters", value: "3/0" }),
      ),
    );
    assertTrue(
      Either.isLeft(
        Schema.decodeUnknownEither(Meters)({ unit: "Meters", value: "1.5" }),
      ),
    );
    assertTrue(
      Either.isLeft(
        Schema.decodeUnknownEither(Meters)({ unit: "Seconds", value: "1" }),
      ),
    );
  });

  it("QuantityExactFromSelf rejects float quantities", () => {
    assertFalse(
      Schema.is(QuantityExact.QuantityExactFromSelf("Meters"))(
        Quantity.make("Meters", 1),
      ),
    );
    assertTrue(
      Schema.is(QuantityExact.QuantityExactFromSelf("Meters"))(
        meters(Rational.one),
      ),
    );
  });
});

describe("inspection", () => {
  it("formats via Inspectable", () => {
    deepStrictEqual(
      QuantityExact.make(
        Unit.rate("Meters", "Seconds"),
        Rational.unsafeMake(3n, 2n),
      ).toJSON(),
      {
        _id: "QuantityExact",
        unit: "(Meters/Seconds)",
        value: "3/2",
      },
    );
  });
});

describe("type-level", () => {
  it("infers unit tags and Option shapes through the algebra", () => {
    // Compile-time inference checks.
    const rate: Option.Option<
      QuantityExact.QuantityExact<Unit.Rate<Length.Meters, "Seconds">>
    > = QuantityExact.per(meters(Rational.one), seconds(Rational.one));
    const unsafeRate: QuantityExact.QuantityExact<
      Unit.Rate<Length.Meters, "Seconds">
    > = QuantityExact.unsafePer(meters(Rational.one), seconds(Rational.one));
    const dependent: QuantityExact.QuantityExact<Length.Meters> =
      QuantityExact.at(unsafeRate, seconds(Rational.one));
    const independent: Option.Option<QuantityExact.QuantityExact<"Seconds">> =
      QuantityExact.at_(dependent, unsafeRate);
    const floatQuantity: Option.Option<Quantity.Quantity<Length.Meters>> =
      QuantityExact.toQuantity(dependent);

    assertTrue(Option.isSome(rate));
    assertTrue(Option.isSome(independent));
    assertTrue(Option.isSome(floatQuantity));
  });
});
