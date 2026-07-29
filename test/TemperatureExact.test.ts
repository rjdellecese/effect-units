import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { rational, testExactRoundtrips } from "./testUtilsExact.ts";
import * as TemperatureExact from "../src/TemperatureExact.ts";
import * as Rational from "../src/Rational.ts";
import * as Temperature from "../src/Temperature.ts";

describe("TemperatureExact", () => {
  testExactRoundtrips([
    [TemperatureExact.kelvins, TemperatureExact.inKelvins],
    [TemperatureExact.degreesCelsius, TemperatureExact.inDegreesCelsius],
    [TemperatureExact.degreesFahrenheit, TemperatureExact.inDegreesFahrenheit],
  ]);
  testExactRoundtrips([
    [TemperatureExact.celsiusDegrees, TemperatureExact.inCelsiusDegrees],
    [TemperatureExact.fahrenheitDegrees, TemperatureExact.inFahrenheitDegrees],
  ]);

  it("relates the Celsius, Fahrenheit, and Kelvin scales exactly", () => {
    assertTrue(
      Equal.equals(
        TemperatureExact.degreesFahrenheit(Rational.makeUnsafe(32n)),
        TemperatureExact.degreesCelsius(Rational.zero),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.degreesFahrenheit(Rational.makeUnsafe(212n)),
        TemperatureExact.degreesCelsius(Rational.makeUnsafe(100n)),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.inDegreesFahrenheit(
          TemperatureExact.degreesCelsius(Rational.makeUnsafe(100n)),
        ),
        Rational.makeUnsafe(212n),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.degreesCelsius(Rational.makeUnsafe(-5463n, 20n)),
        TemperatureExact.absoluteZero,
      ),
    );
  });

  it("plus and minus are inverses", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, (a, b) => {
        const temperature = TemperatureExact.kelvins(a);
        const delta = TemperatureExact.celsiusDegrees(b);
        const raised = TemperatureExact.plus(temperature, delta);

        assertTrue(
          Equal.equals(TemperatureExact.minus(raised, temperature), delta),
        );
      }),
    );
  });

  it("a Fahrenheit degree is five ninths of a Celsius degree", () => {
    assertTrue(
      Equal.equals(
        TemperatureExact.inCelsiusDegrees(
          TemperatureExact.fahrenheitDegrees(Rational.makeUnsafe(9n)),
        ),
        Rational.makeUnsafe(5n),
      ),
    );
  });

  it("orders temperatures", () => {
    const cold = TemperatureExact.degreesCelsius(Rational.zero);
    const warm = TemperatureExact.degreesCelsius(Rational.makeUnsafe(20n));
    const hot = TemperatureExact.degreesCelsius(Rational.makeUnsafe(100n));

    assertTrue(TemperatureExact.isLessThan(cold, warm));
    assertTrue(TemperatureExact.isGreaterThan(hot, warm));
    assertTrue(TemperatureExact.equals(TemperatureExact.min(cold, warm), cold));
    assertTrue(TemperatureExact.equals(TemperatureExact.max(cold, warm), warm));
    assertTrue(
      TemperatureExact.equals(
        TemperatureExact.clamp(hot, { minimum: cold, maximum: warm }),
        warm,
      ),
    );
  });

  it("encodes and decodes through the schema", () => {
    FastCheck.assert(
      FastCheck.property(rational, (r) => {
        const temperature = TemperatureExact.kelvins(r);
        const decoded = Schema.decodeSync(
          TemperatureExact.TemperatureExactFromStruct,
        )(
          Schema.encodeSync(TemperatureExact.TemperatureExactFromStruct)(
            temperature,
          ),
        );

        assertTrue(Equal.equals(decoded, temperature));
      }),
    );
  });

  it("carries a unit discriminator in the wire format", () => {
    deepStrictEqual(
      Schema.encodeSync(TemperatureExact.TemperatureExactFromStruct)(
        TemperatureExact.degreesCelsius(Rational.zero),
      ),
      { unit: "Kelvins", value: "5463/20" },
    );
  });

  // The identity schema carries the wire format as a `toCodecJson`
  // annotation. Without it a declaration falls back to `Json` and throws on
  // any non-JSON value, so the nesting test below is a regression test. Note
  // the nested `Rational` lowers to its string form on its own—the struct
  // never names `Rational.RationalFromString`.

  it("derives the same wire format through toCodecJson", () => {
    const temperature = TemperatureExact.degreesCelsius(Rational.zero);

    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(TemperatureExact.TemperatureExact))(
        temperature,
      ),
      Schema.encodeSync(TemperatureExact.TemperatureExactFromStruct)(
        temperature,
      ),
    );
  });

  it("serializes when nested inside a caller's own schema", () => {
    const Reading = Schema.Struct({
      city: Schema.String,
      temperature: TemperatureExact.TemperatureExact,
    });
    const codec = Schema.toCodecJson(Reading);
    const reading = {
      city: "Oslo",
      temperature: TemperatureExact.degreesCelsius(Rational.zero),
    };

    const encoded = Schema.encodeSync(codec)(reading);

    deepStrictEqual(encoded, {
      city: "Oslo",
      temperature: { unit: "Kelvins", value: "5463/20" },
    });

    // Survives an actual JSON round trip, not just structural equality.
    const decoded = Schema.decodeUnknownSync(codec)(
      JSON.parse(JSON.stringify(encoded)),
    );

    assertTrue(Equal.equals(decoded.temperature, reading.temperature));
  });

  it("absolute zero is zero kelvins", () => {
    assertTrue(
      Equal.equals(
        TemperatureExact.inKelvins(TemperatureExact.absoluteZero),
        Rational.zero,
      ),
    );
  });

  describe("interop", () => {
    it("fromTemperature is the exact image of the float temperature", () => {
      const temperature = TemperatureExact.fromTemperature(
        Temperature.kelvins(0.5),
      );

      assertTrue(Option.isSome(temperature));
      assertTrue(
        Equal.equals(
          TemperatureExact.inKelvins(Option.getOrThrow(temperature)),
          Rational.makeUnsafe(1n, 2n),
        ),
      );
    });

    it("roundtrips through the float module", () => {
      FastCheck.assert(
        FastCheck.property(rational, (r) => {
          const temperature = TemperatureExact.kelvins(r);
          const back = TemperatureExact.fromTemperature(
            Option.getOrThrow(TemperatureExact.toTemperature(temperature)),
          );

          // One correct rounding out, exact back in.
          assertTrue(
            Equal.equals(
              Rational.toNumberUnsafe(
                TemperatureExact.inKelvins(Option.getOrThrow(back)),
              ),
              Rational.toNumberUnsafe(r),
            ),
          );
        }),
      );
    });

    it("matches the float module bit-for-bit", () => {
      assertEquals(
        Rational.toNumberUnsafe(
          TemperatureExact.fahrenheitDegrees(Rational.one).value,
        ),
        Temperature.fahrenheitDegrees(1).value,
      );
    });
  });
});
