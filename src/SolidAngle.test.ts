import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Angle from "./Angle";
import { isCloseTo, testRoundtrips } from "./internal/testUtils";
import * as SolidAngle from "./SolidAngle";

describe("SolidAngle", () => {
  testRoundtrips([
    [SolidAngle.steradians, SolidAngle.inSteradians],
    [SolidAngle.spats, SolidAngle.inSpats],
    [SolidAngle.squareDegrees, SolidAngle.inSquareDegrees],
  ]);

  it("one spat is 4π steradians", () => {
    assertTrue(
      isCloseTo(SolidAngle.inSteradians(SolidAngle.spats(1)), 4 * Math.PI),
    );
  });

  it("a full-sphere cone is one spat", () => {
    // A cone with apex angle 2π (a full turn) covers the whole sphere.
    assertTrue(
      isCloseTo(SolidAngle.inSpats(SolidAngle.conical(Angle.turns(1))), 1),
    );
  });

  it("a right-angled cone matches the closed form", () => {
    assertTrue(
      isCloseTo(
        SolidAngle.inSteradians(SolidAngle.conical(Angle.degrees(90))),
        2 * Math.PI * (1 - Math.cos(Math.PI / 4)),
      ),
    );
  });

  it("a right-angled square pyramid matches the closed form", () => {
    // 4·asin(sin²(45°)) = 4·asin(1/2) = 2π/3
    assertTrue(
      isCloseTo(
        SolidAngle.inSteradians(
          SolidAngle.pyramidal(Angle.degrees(90), Angle.degrees(90)),
        ),
        (2 * Math.PI) / 3,
      ),
    );
  });
});
