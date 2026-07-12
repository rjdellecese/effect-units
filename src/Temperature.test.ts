import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import { closeTo, double } from "./internal/testUtils";
import * as Temperature from "./Temperature";

describe("Temperature", () => {
  const testRoundtrip = <Q>(
    there: (n: number) => Q,
    back: (q: Q) => number,
  ) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          // Temperature conversions are additive (offset by 273.15), so
          // their error is absolute, not relative to the input.
          assertTrue(closeTo(pipe(n, there, back), n, 1e-9, 1e-9));
        }),
      );
    });
  };

  testRoundtrip(Temperature.kelvins, Temperature.inKelvins);
  testRoundtrip(Temperature.degreesCelsius, Temperature.inDegreesCelsius);
  testRoundtrip(
    Temperature.degreesFahrenheit,
    Temperature.inDegreesFahrenheit,
  );
  testRoundtrip(Temperature.celsiusDegrees, Temperature.inCelsiusDegrees);
  testRoundtrip(
    Temperature.fahrenheitDegrees,
    Temperature.inFahrenheitDegrees,
  );

  it("relates the Celsius, Fahrenheit, and Kelvin scales", () => {
    assertTrue(
      closeTo(
        Temperature.inDegreesCelsius(Temperature.degreesFahrenheit(32)),
        0,
        1e-9,
        1e-9,
      ),
    );
    assertTrue(
      closeTo(
        Temperature.inDegreesCelsius(Temperature.degreesFahrenheit(212)),
        100,
      ),
    );
    assertTrue(
      closeTo(
        Temperature.inKelvins(Temperature.degreesCelsius(-273.15)),
        0,
        1e-9,
        1e-9,
      ),
    );
  });

  it("plus and minus are inverses", () => {
    FastCheck.assert(
      FastCheck.property(double, double, (a, b) => {
        const temperature = Temperature.kelvins(a);
        const delta = Temperature.celsiusDegrees(b);
        const raised = Temperature.plus(temperature, delta);

        assertTrue(
          closeTo(
            Temperature.minus(raised, temperature).value,
            delta.value,
            1e-9,
            // Absolute fallback: adding then subtracting a large temperature
            // absorbs deltas far below its own magnitude.
            1e-9 * Math.max(Math.abs(a), 1),
          ),
        );
      }),
    );
  });

  it("a Fahrenheit degree is five ninths of a Celsius degree", () => {
    assertTrue(
      closeTo(
        Temperature.inCelsiusDegrees(Temperature.fahrenheitDegrees(9)),
        5,
      ),
    );
  });

  it("orders temperatures", () => {
    const cold = Temperature.degreesCelsius(0);
    const warm = Temperature.degreesCelsius(20);
    const hot = Temperature.degreesCelsius(100);

    assertTrue(Temperature.lessThan(cold, warm));
    assertTrue(Temperature.greaterThan(hot, warm));
    assertTrue(Temperature.equals(Temperature.min(cold, warm), cold));
    assertTrue(Temperature.equals(Temperature.max(cold, warm), warm));
    assertTrue(
      Temperature.equals(
        Temperature.clamp(hot, { minimum: cold, maximum: warm }),
        warm,
      ),
    );
  });

  it("encodes and decodes through the schema", () => {
    FastCheck.assert(
      FastCheck.property(double, (n) => {
        const temperature = Temperature.kelvins(n);
        const decoded = Schema.decodeSync(Temperature.Temperature)(
          Schema.encodeSync(Temperature.Temperature)(temperature),
        );

        assertTrue(Equal.equals(decoded, temperature));
      }),
    );
  });

  it("absolute zero is zero kelvins", () => {
    assertEquals(Temperature.inKelvins(Temperature.absoluteZero), 0);
  });
});
