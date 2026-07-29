import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/testing/FastCheck";

import { isCloseTo } from "./testUtils.ts";
import * as Constants from "../src/internal/constants.ts";
import * as ConstantsExact from "../src/internal/constantsExact.ts";
import * as PrefixExact from "../src/internal/prefixExact.ts";
import * as Duration from "../src/Duration.ts";
import * as Length from "../src/Length.ts";
import * as Prefix from "../src/Prefix.ts";
import * as Rational from "../src/Rational.ts";
import * as Speed from "../src/Speed.ts";
import * as Temperature from "../src/Temperature.ts";
import * as Volume from "../src/Volume.ts";

const rational = FastCheck.tuple(
  FastCheck.bigInt({ min: -(2n ** 64n), max: 2n ** 64n }),
  FastCheck.bigInt({ min: 1n, max: 2n ** 32n }),
).map(([n, d]) => Rational.makeUnsafe(n, d));

describe("float constants stay pinned to their historical bit patterns", () => {
  // Hardcoded literals, not imports: a change to either family must fail
  // here, never re-pin silently.
  it("pins the shared constants", () => {
    assertEquals(Constants.metersPerInch, 0.0254);
    assertEquals(Constants.metersPerFoot, 0.3048);
    assertEquals(Constants.metersPerYard, 0.9144);
    assertEquals(Constants.metersPerMile, 1609.344);
    assertEquals(Constants.kilogramsPerPound, 0.45359237);
    assertEquals(Constants.gee, 9.80665);
    assertEquals(Constants.newtonsPerPoundForce, 0.45359237 * 9.80665);
    assertEquals(Constants.secondsPerMinute, 60);
    assertEquals(Constants.secondsPerHour, 3600);
  });
});

describe("exact constants are bit-identical to the float constants", () => {
  it("matches every shared constant", () => {
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.metersPerInch),
      Constants.metersPerInch,
    );
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.metersPerFoot),
      Constants.metersPerFoot,
    );
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.metersPerYard),
      Constants.metersPerYard,
    );
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.metersPerMile),
      Constants.metersPerMile,
    );
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.kilogramsPerPound),
      Constants.kilogramsPerPound,
    );
    assertEquals(Rational.toNumberUnsafe(ConstantsExact.gee), Constants.gee);
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.secondsPerMinute),
      Constants.secondsPerMinute,
    );
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.secondsPerHour),
      Constants.secondsPerHour,
    );
  });

  it("matches the derived newtonsPerPoundForce", () => {
    // The float side is a chain (two roundings); the exact side is the true
    // product, rounded once. They agree bit-for-bit.
    assertEquals(
      Rational.toNumberUnsafe(ConstantsExact.newtonsPerPoundForce),
      Constants.newtonsPerPoundForce,
    );
  });
});

describe("exact prefixes agree with Prefix", () => {
  it("matches toBase and toPrefixed for every prefix", () => {
    for (const prefix of Prefix.Prefix.literals) {
      assertEquals(
        Rational.toNumberUnsafe(PrefixExact.toBase(prefix, Rational.one)),
        Prefix.toBase(prefix, 1),
      );
      // toPrefixed is compared within a ulp rather than bit-for-bit: the
      // float side deliberately divides by the toBase factor (for roundtrip
      // stability), and dividing 1 by a correctly rounded 10^k is itself one
      // rounding, which for a few negative exponents misses the true power
      // of ten by one ulp. The exact side has no such artifact—unit
      // modules only bake in toBase factors, which match exactly.
      assertTrue(
        isCloseTo(
          Rational.toNumberUnsafe(PrefixExact.toPrefixed(prefix, Rational.one)),
          Prefix.toPrefixed(prefix, 1),
          { relativeTolerance: Number.EPSILON },
        ),
      );
    }
  });

  it("roundtrips exactly", () => {
    FastCheck.assert(
      FastCheck.property(rational, (r) => {
        for (const prefix of ["Quetta", "Kilo", "Centi", "Quecto"] as const) {
          assertTrue(
            Equal.equals(
              PrefixExact.toPrefixed(prefix, PrefixExact.toBase(prefix, r)),
              r,
            ),
          );
        }
      }),
    );
  });
});

describe("representative module factors are bit-identical", () => {
  // Early cross-family pins for factors the exact unit modules will bake in:
  // the exact rational, evaluated to float, must equal the float module's
  // computed factor (the float constructor's stored base value at 1).
  const cases: ReadonlyArray<
    readonly [label: string, exact: Rational.Rational, float: number]
  > = [
    [
      "angstrom",
      Rational.makeUnsafe(1n, 10n ** 10n),
      Length.angstroms(1).value,
    ],
    ["point", Rational.makeUnsafe(127n, 360000n), Length.points(1).value],
    [
      "astronomicalUnit",
      Rational.makeUnsafe(149597870700n),
      Length.astronomicalUnits(1).value,
    ],
    [
      "lightYear",
      Rational.makeUnsafe(9460730472580800n),
      Length.lightYears(1).value,
    ],
    [
      "julianYear",
      Rational.makeUnsafe(31557600n),
      Duration.julianYears(1).value,
    ],
    [
      "kilometerPerHour",
      Rational.makeUnsafe(5n, 18n),
      Speed.kilometersPerHour(1).value,
    ],
    [
      "milePerHour",
      Rational.makeUnsafe(1397n, 3125n),
      Speed.milesPerHour(1).value,
    ],
    ["liter", Rational.makeUnsafe(1n, 1000n), Volume.liters(1).value],
    [
      "usLiquidGallon",
      Rational.makeUnsafe(3785411784n, 10n ** 12n),
      Volume.usLiquidGallons(1).value,
    ],
    [
      "usDryGallon",
      Rational.makeUnsafe(440488377086n, 10n ** 14n),
      Volume.usDryGallons(1).value,
    ],
    [
      "imperialGallon",
      Rational.makeUnsafe(454609n, 10n ** 8n),
      Volume.imperialGallons(1).value,
    ],
    [
      "fahrenheitDegree",
      Rational.makeUnsafe(5n, 9n),
      Temperature.fahrenheitDegrees(1).value,
    ],
    ["thou", Rational.makeUnsafe(127n, 5000000n), Length.thou(1).value],
    ["cssPixel", Rational.makeUnsafe(127n, 480000n), Length.cssPixels(1).value],
    ["pica", Rational.makeUnsafe(127n, 30000n), Length.picas(1).value],
  ];

  for (const [label, exact, float] of cases) {
    it(`matches ${label}`, () => {
      assertEquals(Rational.toNumberUnsafe(exact), float);
    });
  }

  it("matches the celsius offset", () => {
    assertEquals(
      Rational.toNumberUnsafe(Rational.makeUnsafe(5463n, 20n)),
      Temperature.inKelvins(Temperature.degreesCelsius(0)),
    );
  });
});
