import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area.js";
import * as Force from "./Force.js";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "../test/testUtils.js";
import * as Pressure from "./Pressure.js";
import * as Quantity from "./Quantity.js";

describe("Pressure", () => {
  testRoundtrips([
    [Pressure.pascals, Pressure.inPascals],
    [Pressure.kilopascals, Pressure.inKilopascals],
    [Pressure.megapascals, Pressure.inMegapascals],
    [Pressure.poundsPerSquareInch, Pressure.inPoundsPerSquareInch],
    [Pressure.atmospheres, Pressure.inAtmospheres],
  ]);

  testAnchors(Pressure.inPascals, [
    [Pressure.kilopascals, 1e3],
    [Pressure.megapascals, 1e6],
    [Pressure.poundsPerSquareInch, 4.4482216152605 / 6.4516e-4],
    [Pressure.atmospheres, 101325],
  ]);

  it("is a force per an area", () => {
    assertTrue(
      isQuantityCloseTo(
        Quantity.per(Force.newtons(10), Area.squareMeters(2)),
        Pressure.pascals(5),
      ),
    );
  });

  it("relates atmospheres to pascals", () => {
    assertTrue(isCloseTo(Pressure.inPascals(Pressure.atmospheres(1)), 101325));
  });

  it("relates pounds per square inch to pascals", () => {
    assertTrue(
      isCloseTo(
        Pressure.inPascals(Pressure.poundsPerSquareInch(1)),
        6894.757293168361,
        { relativeTolerance: 1e-12 },
      ),
    );
  });
});
