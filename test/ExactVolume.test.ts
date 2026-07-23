import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactVolume from "../src/ExactVolume.ts";
import * as Rational from "../src/Rational.ts";
import * as Volume from "../src/Volume.ts";

describe("ExactVolume", () => {
  testExactRoundtrips([
    [ExactVolume.cubicMeters, ExactVolume.inCubicMeters],
    [ExactVolume.liters, ExactVolume.inLiters],
    [ExactVolume.milliliters, ExactVolume.inMilliliters],
    [ExactVolume.cubicCentimeters, ExactVolume.inCubicCentimeters],
    [ExactVolume.cubicInches, ExactVolume.inCubicInches],
    [ExactVolume.cubicFeet, ExactVolume.inCubicFeet],
    [ExactVolume.cubicYards, ExactVolume.inCubicYards],
    [ExactVolume.usLiquidGallons, ExactVolume.inUsLiquidGallons],
    [ExactVolume.usLiquidQuarts, ExactVolume.inUsLiquidQuarts],
    [ExactVolume.usLiquidPints, ExactVolume.inUsLiquidPints],
    [ExactVolume.usFluidOunces, ExactVolume.inUsFluidOunces],
    [ExactVolume.usDryGallons, ExactVolume.inUsDryGallons],
    [ExactVolume.usDryQuarts, ExactVolume.inUsDryQuarts],
    [ExactVolume.usDryPints, ExactVolume.inUsDryPints],
    [ExactVolume.imperialGallons, ExactVolume.inImperialGallons],
    [ExactVolume.imperialQuarts, ExactVolume.inImperialQuarts],
    [ExactVolume.imperialPints, ExactVolume.inImperialPints],
    [ExactVolume.imperialFluidOunces, ExactVolume.inImperialFluidOunces],
  ]);

  testExactAnchors(ExactVolume.inCubicMeters, [
    [ExactVolume.liters, Rational.make(1n, 1000n)],
    [ExactVolume.milliliters, Rational.make(1n, 10n ** 6n)],
    [ExactVolume.cubicCentimeters, Rational.make(1n, 10n ** 6n)],
    [ExactVolume.cubicInches, Rational.make(2048383n, 125000000000n)],
    [ExactVolume.cubicFeet, Rational.make(55306341n, 1953125000n)],
    [ExactVolume.cubicYards, Rational.make(1493271207n, 1953125000n)],
    [ExactVolume.usLiquidGallons, Rational.make(3785411784n, 10n ** 12n)],
    [ExactVolume.usFluidOunces, Rational.make(3785411784n, 128n * 10n ** 12n)],
    [ExactVolume.usDryGallons, Rational.make(440488377086n, 10n ** 14n)],
    [ExactVolume.imperialGallons, Rational.make(454609n, 10n ** 8n)],
    [ExactVolume.imperialFluidOunces, Rational.make(454609n, 160n * 10n ** 8n)],
  ]);

  it("relates units exactly", () => {
    // The US liquid gallon is exactly 231 cubic inches.
    assertTrue(
      Equal.equals(
        ExactVolume.inCubicInches(ExactVolume.usLiquidGallons(Rational.one)),
        Rational.make(231n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactVolume.inUsFluidOunces(ExactVolume.usLiquidGallons(Rational.one)),
        Rational.make(128n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactVolume.inImperialFluidOunces(
          ExactVolume.imperialGallons(Rational.one),
        ),
        Rational.make(160n),
      ),
    );
    assertTrue(
      Equal.equals(
        ExactVolume.inLiters(ExactVolume.cubicMeters(Rational.one)),
        Rational.make(1000n),
      ),
    );
  });

  it("matches the float module bit-for-bit where its chains stay exact", () => {
    // cubicFeet is excluded: the float chain (0.3048 ** 3) double-rounds one
    // ulp above the correctly rounded exact value, and the float side keeps
    // its historical value by design.
    for (const [exactCtor, floatCtor] of [
      [ExactVolume.liters, Volume.liters],
      [ExactVolume.milliliters, Volume.milliliters],
      [ExactVolume.cubicCentimeters, Volume.cubicCentimeters],
      [ExactVolume.cubicInches, Volume.cubicInches],
      [ExactVolume.cubicYards, Volume.cubicYards],
      [ExactVolume.usLiquidGallons, Volume.usLiquidGallons],
      [ExactVolume.usLiquidQuarts, Volume.usLiquidQuarts],
      [ExactVolume.usLiquidPints, Volume.usLiquidPints],
      [ExactVolume.usFluidOunces, Volume.usFluidOunces],
      [ExactVolume.usDryGallons, Volume.usDryGallons],
      [ExactVolume.usDryQuarts, Volume.usDryQuarts],
      [ExactVolume.usDryPints, Volume.usDryPints],
      [ExactVolume.imperialGallons, Volume.imperialGallons],
      [ExactVolume.imperialQuarts, Volume.imperialQuarts],
      [ExactVolume.imperialPints, Volume.imperialPints],
      [ExactVolume.imperialFluidOunces, Volume.imperialFluidOunces],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
