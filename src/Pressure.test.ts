import { describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";

import * as Area from "./Area";
import * as Force from "./Force";
import { closeTo, double, quantityCloseTo } from "./internal/testUtils";
import * as Pressure from "./Pressure";
import * as Quantity from "./Quantity";

describe("Pressure", () => {
  const roundtrip = [
    { there: Pressure.pascals, back: Pressure.inPascals },
    { there: Pressure.kilopascals, back: Pressure.inKilopascals },
    { there: Pressure.megapascals, back: Pressure.inMegapascals },
    {
      there: Pressure.poundsPerSquareInch,
      back: Pressure.inPoundsPerSquareInch,
    },
    { there: Pressure.atmospheres, back: Pressure.inAtmospheres },
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

  it("is a force per an area", () => {
    assertTrue(
      quantityCloseTo(
        Quantity.per(Force.newtons(10), Area.squareMeters(2)),
        Pressure.pascals(5),
      ),
    );
  });

  it("relates atmospheres to pascals", () => {
    assertTrue(closeTo(Pressure.inPascals(Pressure.atmospheres(1)), 101325));
  });

  it("relates pounds per square inch to pascals", () => {
    assertTrue(
      closeTo(
        Pressure.inPascals(Pressure.poundsPerSquareInch(1)),
        6894.757293168361,
        1e-12,
      ),
    );
  });
});
