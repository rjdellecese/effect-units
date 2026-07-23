import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";

import { testExactAnchors, testExactRoundtrips } from "./exactTestUtils.ts";
import * as ExactLength from "../src/ExactLength.ts";
import * as ExactQuantity from "../src/ExactQuantity.ts";
import * as ExactSpeed from "../src/ExactSpeed.ts";
import * as Rational from "../src/Rational.ts";

describe("ExactSpeed", () => {
  testExactRoundtrips([
    [ExactSpeed.metersPerSecond, ExactSpeed.inMetersPerSecond],
    [ExactSpeed.kilometersPerHour, ExactSpeed.inKilometersPerHour],
    [ExactSpeed.feetPerSecond, ExactSpeed.inFeetPerSecond],
    [ExactSpeed.milesPerHour, ExactSpeed.inMilesPerHour],
  ]);

  testExactAnchors(ExactSpeed.inMetersPerSecond, [
    [ExactSpeed.kilometersPerHour, Rational.make(5n, 18n)],
    [ExactSpeed.feetPerSecond, Rational.make(381n, 1250n)],
    [ExactSpeed.milesPerHour, Rational.make(1397n, 3125n)],
  ]);

  it("is the unit of an exact length-per-duration rate", () => {
    const rate = ExactQuantity.per(
      ExactLength.miles(Rational.one),
      ExactQuantity.make("Seconds", Rational.make(3600n)),
    );

    assertTrue(Option.isSome(rate));
    assertTrue(
      Equal.equals(
        ExactSpeed.inMilesPerHour(Option.getOrThrow(rate)),
        Rational.one,
      ),
    );
  });
});
