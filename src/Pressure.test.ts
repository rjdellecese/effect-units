import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";

import * as Area from "./Area";
import * as Force from "./Force";
import {
  isCloseTo,
  isQuantityCloseTo,
  testRoundtrip,
} from "./internal/testUtils";
import * as Pressure from "./Pressure";
import * as Quantity from "./Quantity";

describe("Pressure", () => {
  testRoundtrip(Pressure.pascals, Pressure.inPascals);
  testRoundtrip(Pressure.kilopascals, Pressure.inKilopascals);
  testRoundtrip(Pressure.megapascals, Pressure.inMegapascals);
  testRoundtrip(Pressure.poundsPerSquareInch, Pressure.inPoundsPerSquareInch);
  testRoundtrip(Pressure.atmospheres, Pressure.inAtmospheres);

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
