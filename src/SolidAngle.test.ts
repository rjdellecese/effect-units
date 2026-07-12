import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Angle from "./Angle";
import { closeTo, double } from "./internal/testUtils";
import * as SolidAngle from "./SolidAngle";

describe("SolidAngle", () => {
  const roundtrip = [
    { there: SolidAngle.steradians, back: SolidAngle.inSteradians },
    { there: SolidAngle.spats, back: SolidAngle.inSpats },
    { there: SolidAngle.squareDegrees, back: SolidAngle.inSquareDegrees },
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

  it("one spat is 4π steradians", () => {
    assertTrue(closeTo(SolidAngle.inSteradians(SolidAngle.spats(1)), 4 * Math.PI));
  });

  it("a full-sphere cone is one spat", () => {
    // A cone with apex angle 2π (a full turn) covers the whole sphere.
    assertTrue(closeTo(SolidAngle.inSpats(SolidAngle.conical(Angle.turns(1))), 1));
  });

  it("a right-angled cone matches the closed form", () => {
    assertTrue(
      closeTo(
        SolidAngle.inSteradians(SolidAngle.conical(Angle.degrees(90))),
        2 * Math.PI * (1 - Math.cos(Math.PI / 4)),
      ),
    );
  });

  it("a right-angled square pyramid matches the closed form", () => {
    // 4·asin(sin²(45°)) = 4·asin(1/2) = 2π/3
    assertTrue(
      closeTo(
        SolidAngle.inSteradians(
          SolidAngle.pyramidal(Angle.degrees(90), Angle.degrees(90)),
        ),
        (2 * Math.PI) / 3,
      ),
    );
  });
});
