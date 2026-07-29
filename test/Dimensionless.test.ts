import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertTrue,
  deepStrictEqual,
} from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Schema from "effect/Schema";

import * as Dimensionless from "../src/Dimensionless.ts";
import * as Length from "../src/Length.ts";
import * as Quantity from "../src/Quantity.ts";
import {
  isCloseTo,
  isQuantityCloseTo,
  testAnchors,
  testRoundtrips,
} from "./testUtils.ts";

describe("Dimensionless", () => {
  testRoundtrips([
    [Dimensionless.fraction, Dimensionless.inFraction],
    [Dimensionless.percent, Dimensionless.inPercent],
    [Dimensionless.perMille, Dimensionless.inPerMille],
    [Dimensionless.basisPoints, Dimensionless.inBasisPoints],
    [Dimensionless.partsPerMillion, Dimensionless.inPartsPerMillion],
    [Dimensionless.partsPerBillion, Dimensionless.inPartsPerBillion],
  ]);

  testAnchors(Dimensionless.inFraction, [
    [Dimensionless.percent, 1 / 100],
    [Dimensionless.perMille, 1 / 1000],
    [Dimensionless.basisPoints, 1 / 10000],
    [Dimensionless.partsPerMillion, 1 / 1000000],
    [Dimensionless.partsPerBillion, 1 / 1000000000],
  ]);

  it("relates the scales to one another", () => {
    assertTrue(isCloseTo(Dimensionless.inPercent(Dimensionless.one), 100));
    assertTrue(
      isCloseTo(Dimensionless.inBasisPoints(Dimensionless.percent(1)), 100),
    );
    assertTrue(
      isCloseTo(Dimensionless.inPerMille(Dimensionless.percent(1)), 10),
    );
    assertTrue(
      isCloseTo(
        Dimensionless.inPartsPerBillion(Dimensionless.partsPerMillion(1)),
        1000,
      ),
    );
  });

  it("complement is the rest of the whole", () => {
    assertTrue(
      isCloseTo(
        Dimensionless.inPercent(
          Dimensionless.complement(Dimensionless.percent(30)),
        ),
        70,
      ),
    );
    assertTrue(
      isCloseTo(
        Dimensionless.inPercent(
          Dimensionless.complement(Dimensionless.percent(150)),
        ),
        -50,
      ),
    );
  });

  // The end-to-end story the module exists for: a percentage crosses into
  // and out of dimensioned quantities without ever becoming a bare number.
  describe("with the Quantity bridge", () => {
    it("applies a percentage to a dimensioned quantity", () => {
      const discounted = Quantity.times(
        Length.meters(200),
        Dimensionless.complement(Dimensionless.percent(10)),
      );

      assertTrue(isQuantityCloseTo(discounted, Length.meters(180)));
    });

    it("recovers a percentage from two quantities", () => {
      const completed = Quantity.ratio(Length.meters(30), Length.kilometers(1));

      assertTrue(isCloseTo(Dimensionless.inPercent(completed), 3));
    });
  });

  describe("schema", () => {
    it("encodes and decodes the wire format", () => {
      const quarter = Dimensionless.percent(25);
      const encoded = Schema.encodeSync(Dimensionless.DimensionlessFromStruct)(
        quarter,
      );

      deepStrictEqual(encoded, { unit: "Unitless", value: 0.25 });
      assertTrue(
        Equal.equals(
          Schema.decodeSync(Dimensionless.DimensionlessFromStruct)(encoded),
          quarter,
        ),
      );
    });

    it("serializes when nested inside a caller's own schema", () => {
      const Reading = Schema.Struct({
        label: Schema.String,
        share: Dimensionless.Dimensionless,
      });
      const codec = Schema.toCodecJson(Reading);
      const reading = { label: "market", share: Dimensionless.percent(12.5) };

      const encoded = Schema.encodeSync(codec)(reading);

      deepStrictEqual(encoded, {
        label: "market",
        share: { unit: "Unitless", value: 0.125 },
      });

      const decoded = Schema.decodeUnknownSync(codec)(
        JSON.parse(JSON.stringify(encoded)),
      );

      assertEquals(Dimensionless.inPercent(decoded.share), 12.5);
    });
  });
});
