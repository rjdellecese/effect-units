import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Charge from "./Charge";
import * as Current from "./Current";
import * as Duration from "./Duration";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Quantity from "./Quantity";

describe("Current", () => {
  const roundtrip = [
    { there: Current.amperes, back: Current.inAmperes },
    { there: Current.milliamperes, back: Current.inMilliamperes },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(double, (n) => {
          assertTrue(closeTo(pipe(n, there, back), n));
        }),
      );
    });
  });

  it("is a charge per a duration", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Charge.coulombs(10), Duration.seconds(2)),
        Current.amperes(5),
      ),
    );
  });

  it("accumulates ampere hours over an hour", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.at(Current.amperes(1), Duration.hours(1)),
        Charge.ampereHours(1),
      ),
    );
  });
});
