import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as VolumeExact from "../src/VolumeExact.ts";
import * as Rational from "../src/Rational.ts";
import * as Volume from "../src/Volume.ts";

describe("VolumeExact", () => {
  testExactRoundtrips([
    [VolumeExact.cubicMeters, VolumeExact.inCubicMeters],
    [VolumeExact.liters, VolumeExact.inLiters],
    [VolumeExact.milliliters, VolumeExact.inMilliliters],
    [VolumeExact.cubicCentimeters, VolumeExact.inCubicCentimeters],
    [VolumeExact.cubicInches, VolumeExact.inCubicInches],
    [VolumeExact.cubicFeet, VolumeExact.inCubicFeet],
    [VolumeExact.cubicYards, VolumeExact.inCubicYards],
    [VolumeExact.usLiquidGallons, VolumeExact.inUsLiquidGallons],
    [VolumeExact.usLiquidQuarts, VolumeExact.inUsLiquidQuarts],
    [VolumeExact.usLiquidPints, VolumeExact.inUsLiquidPints],
    [VolumeExact.usFluidOunces, VolumeExact.inUsFluidOunces],
    [VolumeExact.usDryGallons, VolumeExact.inUsDryGallons],
    [VolumeExact.usDryQuarts, VolumeExact.inUsDryQuarts],
    [VolumeExact.usDryPints, VolumeExact.inUsDryPints],
    [VolumeExact.imperialGallons, VolumeExact.inImperialGallons],
    [VolumeExact.imperialQuarts, VolumeExact.inImperialQuarts],
    [VolumeExact.imperialPints, VolumeExact.inImperialPints],
    [VolumeExact.imperialFluidOunces, VolumeExact.inImperialFluidOunces],
  ]);

  testExactAnchors(VolumeExact.inCubicMeters, [
    [VolumeExact.liters, Rational.unsafeMake(1n, 1000n)],
    [VolumeExact.milliliters, Rational.unsafeMake(1n, 10n ** 6n)],
    [VolumeExact.cubicCentimeters, Rational.unsafeMake(1n, 10n ** 6n)],
    [VolumeExact.cubicInches, Rational.unsafeMake(2048383n, 125000000000n)],
    [VolumeExact.cubicFeet, Rational.unsafeMake(55306341n, 1953125000n)],
    [VolumeExact.cubicYards, Rational.unsafeMake(1493271207n, 1953125000n)],
    [VolumeExact.usLiquidGallons, Rational.unsafeMake(3785411784n, 10n ** 12n)],
    [
      VolumeExact.usFluidOunces,
      Rational.unsafeMake(3785411784n, 128n * 10n ** 12n),
    ],
    [VolumeExact.usDryGallons, Rational.unsafeMake(440488377086n, 10n ** 14n)],
    [VolumeExact.imperialGallons, Rational.unsafeMake(454609n, 10n ** 8n)],
    [
      VolumeExact.imperialFluidOunces,
      Rational.unsafeMake(454609n, 160n * 10n ** 8n),
    ],
  ]);

  it("relates units exactly", () => {
    // The US liquid gallon is exactly 231 cubic inches.
    assertTrue(
      Equal.equals(
        VolumeExact.inCubicInches(VolumeExact.usLiquidGallons(Rational.one)),
        Rational.unsafeMake(231n),
      ),
    );
    assertTrue(
      Equal.equals(
        VolumeExact.inUsFluidOunces(VolumeExact.usLiquidGallons(Rational.one)),
        Rational.unsafeMake(128n),
      ),
    );
    assertTrue(
      Equal.equals(
        VolumeExact.inImperialFluidOunces(
          VolumeExact.imperialGallons(Rational.one),
        ),
        Rational.unsafeMake(160n),
      ),
    );
    assertTrue(
      Equal.equals(
        VolumeExact.inLiters(VolumeExact.cubicMeters(Rational.one)),
        Rational.unsafeMake(1000n),
      ),
    );
  });

  it("matches the float module bit-for-bit", () => {
    for (const [exactCtor, floatCtor] of [
      [VolumeExact.liters, Volume.liters],
      [VolumeExact.milliliters, Volume.milliliters],
      [VolumeExact.cubicCentimeters, Volume.cubicCentimeters],
      [VolumeExact.cubicInches, Volume.cubicInches],
      [VolumeExact.cubicFeet, Volume.cubicFeet],
      [VolumeExact.cubicYards, Volume.cubicYards],
      [VolumeExact.usLiquidGallons, Volume.usLiquidGallons],
      [VolumeExact.usLiquidQuarts, Volume.usLiquidQuarts],
      [VolumeExact.usLiquidPints, Volume.usLiquidPints],
      [VolumeExact.usFluidOunces, Volume.usFluidOunces],
      [VolumeExact.usDryGallons, Volume.usDryGallons],
      [VolumeExact.usDryQuarts, Volume.usDryQuarts],
      [VolumeExact.usDryPints, Volume.usDryPints],
      [VolumeExact.imperialGallons, Volume.imperialGallons],
      [VolumeExact.imperialQuarts, Volume.imperialQuarts],
      [VolumeExact.imperialPints, Volume.imperialPints],
      [VolumeExact.imperialFluidOunces, Volume.imperialFluidOunces],
    ] as const) {
      assertEquals(
        Rational.unsafeToNumber(exactCtor(Rational.one).value),
        floatCtor(1).value,
      );
    }
  });
});
