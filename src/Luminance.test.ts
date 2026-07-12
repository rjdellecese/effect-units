import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Area from "./Area";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Luminance from "./Luminance";
import * as LuminousIntensity from "./LuminousIntensity";
import * as Quantity from "./Quantity";

describe("Luminance", () => {
  const roundtrip = [
    { there: Luminance.nits, back: Luminance.inNits },
    { there: Luminance.footLamberts, back: Luminance.inFootLamberts },
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

  it("is an intensity per an area", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(LuminousIntensity.candelas(10), Area.squareMeters(2)),
        Luminance.nits(5),
      ),
    );
  });
});
