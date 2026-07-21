import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Charge from "../src/Charge.ts";
import * as Current from "../src/Current.ts";
import * as Duration from "../src/Duration.ts";
import { isQuantityCloseTo, testAnchors, testRoundtrips } from "./testUtils.ts";
import * as Quantity from "../src/Quantity.ts";

describe("Current", () => {
  testRoundtrips([
    [Current.amperes, Current.inAmperes],
    [Current.milliamperes, Current.inMilliamperes],
  ]);

  testAnchors(Current.inAmperes, [[Current.milliamperes, 1e-3]]);

  it("is a charge per a duration", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Charge.coulombs(10), Duration.seconds(2)),
        Current.amperes(5),
      ),
    );
  });

  it("accumulates ampere hours over an hour", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.at(Current.amperes(1), Duration.hours(1)),
        Charge.ampereHours(1),
      ),
    );
  });
});
