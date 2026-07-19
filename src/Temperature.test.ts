import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import * as Schema from "effect/Schema";

import { double, isCloseTo, testRoundtrips } from "../test/testUtils.js";
import * as Temperature from "./Temperature.js";

describe("Temperature", () => {
  // Temperature conversions are additive (offset by 273.15), so their error
  // is absolute, not relative to the input.
  const tolerance = { absoluteTolerance: 1e-9 };

  testRoundtrips(
    [
      [Temperature.kelvins, Temperature.inKelvins],
      [Temperature.degreesCelsius, Temperature.inDegreesCelsius],
      [Temperature.degreesFahrenheit, Temperature.inDegreesFahrenheit],
    ],
    tolerance,
  );
  testRoundtrips(
    [
      [Temperature.celsiusDegrees, Temperature.inCelsiusDegrees],
      [Temperature.fahrenheitDegrees, Temperature.inFahrenheitDegrees],
    ],
    tolerance,
  );

  it("relates the Celsius, Fahrenheit, and Kelvin scales", () => {
    assertTrue(
      isCloseTo(
        Temperature.inDegreesCelsius(Temperature.degreesFahrenheit(32)),
        0,
        { absoluteTolerance: 1e-9 },
      ),
    );
    assertTrue(
      isCloseTo(
        Temperature.inDegreesCelsius(Temperature.degreesFahrenheit(212)),
        100,
      ),
    );
    assertTrue(
      isCloseTo(Temperature.inKelvins(Temperature.degreesCelsius(-273.15)), 0, {
        absoluteTolerance: 1e-9,
      }),
    );
  });

  it("plus and minus are inverses", () => {
    FastCheck.assert(
      FastCheck.property(double, double, (a, b) => {
        const temperature = Temperature.kelvins(a);
        const delta = Temperature.celsiusDegrees(b);
        const raised = Temperature.plus(temperature, delta);

        assertTrue(
          isCloseTo(Temperature.minus(raised, temperature).value, delta.value, {
            // Adding then subtracting a large temperature absorbs deltas far
            // below its own magnitude.
            absoluteTolerance: 1e-9 * Math.max(Math.abs(a), 1),
          }),
        );
      }),
    );
  });

  it("a Fahrenheit degree is five ninths of a Celsius degree", () => {
    assertTrue(
      isCloseTo(
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

  it("carries a unit discriminator in the wire format", () => {
    deepStrictEqual(
      Schema.encodeSync(Temperature.Temperature)(Temperature.kelvins(293.15)),
      { unit: "Kelvins", value: 293.15 },
    );
  });

  it("absolute zero is zero kelvins", () => {
    assertEquals(Temperature.inKelvins(Temperature.absoluteZero), 0);
  });
});
