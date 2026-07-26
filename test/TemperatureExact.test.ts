import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
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
        TemperatureExact.degreesFahrenheit(Rational.unsafeMake(32n)),
        TemperatureExact.degreesCelsius(Rational.zero),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.degreesFahrenheit(Rational.unsafeMake(212n)),
        TemperatureExact.degreesCelsius(Rational.unsafeMake(100n)),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.inDegreesFahrenheit(
          TemperatureExact.degreesCelsius(Rational.unsafeMake(100n)),
        ),
        Rational.unsafeMake(212n),
      ),
    );
    assertTrue(
      Equal.equals(
        TemperatureExact.degreesCelsius(Rational.unsafeMake(-5463n, 20n)),
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
          TemperatureExact.fahrenheitDegrees(Rational.unsafeMake(9n)),
        ),
        Rational.unsafeMake(5n),
      ),
    );
  });

  it("orders temperatures", () => {
    const cold = TemperatureExact.degreesCelsius(Rational.zero);
    const warm = TemperatureExact.degreesCelsius(Rational.unsafeMake(20n));
    const hot = TemperatureExact.degreesCelsius(Rational.unsafeMake(100n));

    assertTrue(TemperatureExact.lessThan(cold, warm));
    assertTrue(TemperatureExact.greaterThan(hot, warm));
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
        const decoded = Schema.decodeSync(TemperatureExact.TemperatureExact)(
          Schema.encodeSync(TemperatureExact.TemperatureExact)(temperature),
        );

        assertTrue(Equal.equals(decoded, temperature));
      }),
    );
  });

  it("carries a unit discriminator in the wire format", () => {
    deepStrictEqual(
      Schema.encodeSync(TemperatureExact.TemperatureExact)(
        TemperatureExact.degreesCelsius(Rational.zero),
      ),
      { unit: "Kelvins", value: "5463/20" },
    );
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
          Rational.unsafeMake(1n, 2n),
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
              Rational.unsafeToNumber(
                TemperatureExact.inKelvins(Option.getOrThrow(back)),
              ),
              Rational.unsafeToNumber(r),
            ),
          );
        }),
      );
    });

    it("matches the float module bit-for-bit", () => {
      assertEquals(
        Rational.unsafeToNumber(
          TemperatureExact.fahrenheitDegrees(Rational.one).value,
        ),
        Temperature.fahrenheitDegrees(1).value,
      );
    });
  });
});
