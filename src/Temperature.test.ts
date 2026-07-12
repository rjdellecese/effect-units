import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Temperature from "./Temperature";

const bigDecimal = Arbitrary.make(Schema.BigDecimal);

const closeTo = (
  a: BigDecimal.BigDecimal,
  b: BigDecimal.BigDecimal,
  tolerance = BigDecimal.make(1n, 90),
) => BigDecimal.lessThan(BigDecimal.abs(BigDecimal.subtract(a, b)), tolerance);

describe("Temperature", () => {
  const testRoundtrip = <Q>(
    there: (n: BigDecimal.BigDecimal) => Q,
    back: (q: Q) => BigDecimal.BigDecimal,
  ) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(bigDecimal, (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
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

  // The Fahrenheit factor (5/9) is non-terminating, so cross-scale
  // identities hold to the precision of the rounded constant (~100 digits)
  // rather than exactly; same-scale roundtrips are exact.
  it("relates the Celsius, Fahrenheit, and Kelvin scales", () => {
    assertTrue(
      Temperature.equals(
        Temperature.degreesFahrenheit(BigDecimal.fromBigInt(32n)),
        Temperature.degreesCelsius(BigDecimal.fromBigInt(0n)),
      ),
    );
    assertTrue(
      closeTo(
        Temperature.inDegreesCelsius(
          Temperature.degreesFahrenheit(BigDecimal.fromBigInt(212n)),
        ),
        BigDecimal.fromBigInt(100n),
      ),
    );
    assertEquals(
      Temperature.inKelvins(
        Temperature.degreesCelsius(BigDecimal.make(-27315n, 2)),
      ),
      BigDecimal.normalize(BigDecimal.fromBigInt(0n)),
    );
  });

  it("plus and minus are inverses", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, bigDecimal, (a, b) => {
        const temperature = Temperature.kelvins(a);
        const delta = Temperature.celsiusDegrees(b);
        const raised = Temperature.plus(temperature, delta);

        assertEquals(
          Temperature.minus(raised, temperature).value,
          delta.value,
        );
      }),
    );
  });

  it("a Fahrenheit degree is five ninths of a Celsius degree", () => {
    const delta = Temperature.fahrenheitDegrees(BigDecimal.fromBigInt(9n));

    assertTrue(
      closeTo(
        Temperature.inCelsiusDegrees(delta),
        BigDecimal.fromBigInt(5n),
      ),
    );
  });

  it("orders temperatures", () => {
    const cold = Temperature.degreesCelsius(BigDecimal.fromBigInt(0n));
    const warm = Temperature.degreesCelsius(BigDecimal.fromBigInt(20n));
    const hot = Temperature.degreesCelsius(BigDecimal.fromBigInt(100n));

    assertTrue(Temperature.lessThan(cold, warm));
    assertTrue(Temperature.greaterThan(hot, warm));
    assertTrue(
      Temperature.equals(Temperature.min(cold, warm), cold),
    );
    assertTrue(
      Temperature.equals(Temperature.max(cold, warm), warm),
    );
    assertTrue(
      Temperature.equals(
        Temperature.clamp(hot, { minimum: cold, maximum: warm }),
        warm,
      ),
    );
  });

  it("encodes and decodes through the schema", () => {
    FastCheck.assert(
      FastCheck.property(bigDecimal, (n) => {
        const temperature = Temperature.kelvins(n);
        const decoded = Schema.decodeSync(Temperature.Temperature)(
          Schema.encodeSync(Temperature.Temperature)(temperature),
        );

        assertTrue(Equal.equals(decoded, temperature));
      }),
    );
  });
});
