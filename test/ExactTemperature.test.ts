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

import { rational, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactTemperature from "../src/ExactTemperature.ts";
import * as Rational from "../src/Rational.ts";
import * as Temperature from "../src/Temperature.ts";

describe("ExactTemperature", () => {
  testExactRoundtrips([
    [ExactTemperature.kelvins, ExactTemperature.inKelvins],
    [ExactTemperature.degreesCelsius, ExactTemperature.inDegreesCelsius],
    [ExactTemperature.degreesFahrenheit, ExactTemperature.inDegreesFahrenheit],
  ]);
  testExactRoundtrips([
    [ExactTemperature.celsiusDegrees, ExactTemperature.inCelsiusDegrees],
    [ExactTemperature.fahrenheitDegrees, ExactTemperature.inFahrenheitDegrees],
  ]);

  it("relates the Celsius, Fahrenheit, and Kelvin scales exactly", () => {
    assertTrue(
      Equal.equals(
        ExactTemperature.degreesFahrenheit(Rational.make(32n)),
        ExactTemperature.degreesCelsius(Rational.zero),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactTemperature.degreesFahrenheit(Rational.make(212n)),
        ExactTemperature.degreesCelsius(Rational.make(100n)),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactTemperature.inDegreesFahrenheit(
          ExactTemperature.degreesCelsius(Rational.make(100n)),
        ),
        Rational.make(212n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactTemperature.degreesCelsius(Rational.make(-5463n, 20n)),
        ExactTemperature.absoluteZero,
      ),
    );
  });

  it("plus and minus are inverses", () => {
    FastCheck.assert(
      FastCheck.property(rational, rational, (a, b) => {
        const temperature = ExactTemperature.kelvins(a);
        const delta = ExactTemperature.celsiusDegrees(b);
        const raised = ExactTemperature.plus(temperature, delta);

        assertTrue(
          Equal.equals(ExactTemperature.minus(raised, temperature), delta),
        );
      }),
    );
  });

  it("a Fahrenheit degree is five ninths of a Celsius degree", () => {
    assertTrue(
      Equal.equals(
        ExactTemperature.inCelsiusDegrees(
          ExactTemperature.fahrenheitDegrees(Rational.make(9n)),
        ),
        Rational.make(5n),
      ),
    );
  });

  it("orders temperatures", () => {
    const cold = ExactTemperature.degreesCelsius(Rational.zero);
    const warm = ExactTemperature.degreesCelsius(Rational.make(20n));
    const hot = ExactTemperature.degreesCelsius(Rational.make(100n));

    assertTrue(ExactTemperature.lessThan(cold, warm));
    assertTrue(ExactTemperature.greaterThan(hot, warm));
    assertTrue(ExactTemperature.equals(ExactTemperature.min(cold, warm), cold));
    assertTrue(ExactTemperature.equals(ExactTemperature.max(cold, warm), warm));
    assertTrue(
      ExactTemperature.equals(
        ExactTemperature.clamp(hot, { minimum: cold, maximum: warm }),
        warm,
      ),
    );
  });

  it("encodes and decodes through the schema", () => {
    FastCheck.assert(
      FastCheck.property(rational, (r) => {
        const temperature = ExactTemperature.kelvins(r);
        const decoded = Schema.decodeSync(ExactTemperature.ExactTemperature)(
          Schema.encodeSync(ExactTemperature.ExactTemperature)(temperature),
        );

        assertTrue(Equal.equals(decoded, temperature));
      }),
    );
  });

  it("carries a unit discriminator in the wire format", () => {
    deepStrictEqual(
      Schema.encodeSync(ExactTemperature.ExactTemperature)(
        ExactTemperature.degreesCelsius(Rational.zero),
      ),
      { unit: "Kelvins", value: "5463/20" },
    );
  });

  it("absolute zero is zero kelvins", () => {
    assertTrue(
      Equal.equals(
        ExactTemperature.inKelvins(ExactTemperature.absoluteZero),
        Rational.zero,
      ),
    );
  });

  describe("interop", () => {
    it("fromTemperature is the exact image of the float temperature", () => {
      const temperature = ExactTemperature.fromTemperature(
        Temperature.kelvins(0.5),
      );

      assertTrue(Option.isSome(temperature));
      assertTrue(
        Equal.equals(
          ExactTemperature.inKelvins(Option.getOrThrow(temperature)),
          Rational.make(1n, 2n),
        ),
      );
    });

    it("roundtrips through the float module", () => {
      FastCheck.assert(
        FastCheck.property(rational, (r) => {
          const temperature = ExactTemperature.kelvins(r);
          const back = ExactTemperature.fromTemperature(
            Option.getOrThrow(ExactTemperature.toTemperature(temperature)),
          );

          // One correct rounding out, exact back in.
          assertTrue(
            Equal.equals(
              Rational.unsafeToNumber(
                ExactTemperature.inKelvins(Option.getOrThrow(back)),
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
          ExactTemperature.fahrenheitDegrees(Rational.one).value,
        ),
        Temperature.fahrenheitDegrees(1).value,
      );
    });
  });
});
