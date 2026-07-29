import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./testUtilsExact.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as QuantityExact from "../src/QuantityExact.ts";
import * as SpeedExact from "../src/SpeedExact.ts";
import * as Rational from "../src/Rational.ts";

describe("SpeedExact", () => {
  testExactRoundtrips([
    [SpeedExact.metersPerSecond, SpeedExact.inMetersPerSecond],
    [SpeedExact.kilometersPerHour, SpeedExact.inKilometersPerHour],
    [SpeedExact.feetPerSecond, SpeedExact.inFeetPerSecond],
    [SpeedExact.milesPerHour, SpeedExact.inMilesPerHour],
  ]);

  testExactAnchors(SpeedExact.inMetersPerSecond, [
    [SpeedExact.kilometersPerHour, Rational.makeUnsafe(5n, 18n)],
    [SpeedExact.feetPerSecond, Rational.makeUnsafe(381n, 1250n)],
    [SpeedExact.milesPerHour, Rational.makeUnsafe(1397n, 3125n)],
  ]);

  it("is the unit of an exact length-per-duration rate", () => {
    const rate = QuantityExact.per(
      LengthExact.miles(Rational.one),
      QuantityExact.make("Seconds", Rational.makeUnsafe(3600n)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        SpeedExact.inMilesPerHour(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });
});
