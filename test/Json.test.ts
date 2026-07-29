import { describe, it } from "@effect/vitest";
import { assertTrue, deepStrictEqual } from "@effect/vitest/utils";
import * as Equal from "effect/Equal";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import * as Length from "../src/Length.ts";
import * as LengthExact from "../src/LengthExact.ts";
import * as Rational from "../src/Rational.ts";
import * as Temperature from "../src/Temperature.ts";
import * as TemperatureExact from "../src/TemperatureExact.ts";
import * as Unit from "../src/Unit.ts";

// Every value type carries its wire format as a `toCodecJson` annotation, so
// `Schema.toCodecJson` derives the JSON codec. Without the annotation a
// declaration falls back to `Json` and blows up at runtime on any value that
// is not already JSON—which is what makes the nesting test below a
// regression test, not a nicety.

describe("canonical JSON codecs", () => {
  it("derives the same wire format the named codecs produce", () => {
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Length.Length))(Length.meters(5)),
      Schema.encodeSync(Length.LengthFromStruct)(Length.meters(5)),
    );

    const exact = LengthExact.meters(Rational.makeUnsafe(3n, 2n));

    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(LengthExact.LengthExact))(exact),
      Schema.encodeSync(LengthExact.LengthExactFromStruct)(exact),
    );
  });

  it("freezes the wire format of each value type", () => {
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Length.Length))(Length.meters(5)),
      { unit: "Meters", value: 5 },
    );
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(LengthExact.LengthExact))(
        LengthExact.meters(Rational.makeUnsafe(3n, 2n)),
      ),
      { unit: "Meters", value: "3/2" },
    );
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Rational.Rational))(
        Rational.makeUnsafe(3n, 2n),
      ),
      "3/2",
    );
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Unit.Unit))(
        Unit.rate("Meters", "Seconds"),
      ),
      "(Meters/Seconds)",
    );
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(Temperature.Temperature))(
        Temperature.kelvins(293.15),
      ),
      { unit: "Kelvins", value: 293.15 },
    );
    deepStrictEqual(
      Schema.encodeSync(Schema.toCodecJson(TemperatureExact.TemperatureExact))(
        TemperatureExact.degreesCelsius(Rational.zero),
      ),
      { unit: "Kelvins", value: "5463/20" },
    );
  });

  it("serializes when nested inside a caller's own schema", () => {
    const Trip = Schema.Struct({
      name: Schema.String,
      distance: Length.Length,
      budget: LengthExact.LengthExact,
      rate: Unit.Unit,
    });
    const codec = Schema.toCodecJson(Trip);
    const trip = {
      name: "commute",
      distance: Length.meters(5),
      budget: LengthExact.meters(Rational.makeUnsafe(3n, 2n)),
      rate: Unit.rate("Meters", "Seconds"),
    };

    const encoded = Schema.encodeSync(codec)(trip);

    deepStrictEqual(encoded, {
      name: "commute",
      distance: { unit: "Meters", value: 5 },
      budget: { unit: "Meters", value: "3/2" },
      rate: "(Meters/Seconds)",
    });

    // Survives an actual JSON round trip, not just structural equality.
    const decoded = Schema.decodeUnknownSync(codec)(
      JSON.parse(JSON.stringify(encoded)),
    );

    assertTrue(Equal.equals(decoded.distance, trip.distance));
    assertTrue(Equal.equals(decoded.budget, trip.budget));
    assertTrue(Equal.equals(decoded.rate, trip.rate));
  });

  it("propagates rejections out of nested values", () => {
    const codec = Schema.toCodecJson(
      Schema.Struct({ budget: LengthExact.LengthExact }),
    );

    assertTrue(
      Result.isFailure(
        Schema.decodeUnknownResult(codec)({
          budget: { unit: "Meters", value: "3/0" },
        }),
      ),
    );
    assertTrue(
      Result.isFailure(
        Schema.decodeUnknownResult(codec)({
          budget: { unit: "Seconds", value: "1" },
        }),
      ),
    );
  });

  it("rejects non-finite floats at the JSON boundary", () => {
    const codec = Schema.toCodecJson(Length.Length);

    assertTrue(
      Result.isFailure(Schema.encodeResult(codec)(Length.meters(Infinity))),
    );
    assertTrue(
      Result.isFailure(Schema.encodeResult(codec)(Length.meters(NaN))),
    );
  });
});
