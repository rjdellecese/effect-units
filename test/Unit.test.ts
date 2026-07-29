import { describe, it } from "@effect/vitest";
import {
  assertEquals,
  assertFalse,
  assertTrue,
  throws,
} from "@effect/vitest/utils";
import * as Result from "effect/Result";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Unit from "../src/Unit.ts";

describe("Unit", () => {
  const newtons = Unit.product(
    "Kilograms",
    Unit.rate(Unit.rate("Meters", "Seconds"), "Seconds"),
  );

  it("constructed units support Equal and Hash", () => {
    assertTrue(
      Equal.equals(
        Unit.rate("Meters", "Seconds"),
        Unit.rate("Meters", "Seconds"),
      ),
    );
    assertFalse(
      Equal.equals(
        Unit.rate("Meters", "Seconds"),
        Unit.rate("Seconds", "Meters"),
      ),
    );
    assertTrue(
      Equal.equals(
        newtons,
        Unit.product(
          "Kilograms",
          Unit.rate(Unit.rate("Meters", "Seconds"), "Seconds"),
        ),
      ),
    );
  });

  it("decode inverts encode", () => {
    const units: ReadonlyArray<Unit.Unit> = [
      "Meters",
      Unit.rate("Meters", "Seconds"),
      Unit.squared("Meters"),
      Unit.cubed("Meters"),
      newtons,
      Unit.custom("USD"),
      Unit.rate(Unit.custom("USD"), "Meters"),
      Unit.squared(Unit.custom("USD")),
    ];

    for (const unit of units) {
      const decoded = Unit.decode(Unit.encode(unit));

      assertTrue(Option.isSome(decoded));
      assertTrue(Equal.equals(Option.getOrThrow(decoded), unit));
    }
  });

  it("decode rejects non-canonical strings", () => {
    const invalid = [
      "",
      "Metres",
      "meters",
      "(Meters/Seconds",
      "(Meters?Seconds)",
      "Meters/Seconds",
      "(Meters/Seconds))",
      "(Meters/)",
      "[USD",
      "USD]",
      "[]",
      "[US D]",
      "[1USD]",
      "[US*D]",
      "[USD]x",
    ];

    for (const input of invalid) {
      assertTrue(Option.isNone(Unit.decode(input)));
    }
  });

  it("roundtrips through the schema", () => {
    const encoded = Schema.encodeSync(Unit.UnitFromString)(newtons);

    assertEquals(encoded, "(Kilograms*((Meters/Seconds)/Seconds))");
    assertTrue(
      Equal.equals(Schema.decodeSync(Unit.UnitFromString)(encoded), newtons),
    );
  });

  it("the schema rejects non-canonical strings", () => {
    assertTrue(
      Result.isFailure(
        Schema.decodeResult(Unit.UnitFromString)("(Meters/Seconds"),
      ),
    );
  });

  it("the schema rejects deeply nested input without overflowing the stack", () => {
    assertTrue(
      Result.isFailure(
        Schema.decodeResult(Unit.UnitFromString)(
          "(".repeat(100_000) + "Meters",
        ),
      ),
    );
  });

  describe("custom units", () => {
    it("support Equal and Hash", () => {
      assertTrue(Equal.equals(Unit.custom("USD"), Unit.custom("USD")));
      assertFalse(Equal.equals(Unit.custom("USD"), Unit.custom("EUR")));
      assertTrue(
        Equal.equals(
          Unit.rate(Unit.custom("USD"), "Meters"),
          Unit.rate(Unit.custom("USD"), "Meters"),
        ),
      );
    });

    it("are distinct from base units with the same name", () => {
      assertFalse(Unit.equals(Unit.custom("Meters"), "Meters"));
      assertFalse(Unit.equals("Meters", Unit.custom("Meters")));
      assertFalse(
        Unit.equals(
          Unit.custom("USD"),
          Unit.rate(Unit.custom("USD"), "Meters"),
        ),
      );
    });

    it("encode in bracketed form", () => {
      assertEquals(Unit.encode(Unit.custom("USD")), "[USD]");
      assertEquals(
        Unit.encode(Unit.rate(Unit.custom("USD"), "Meters")),
        "([USD]/Meters)",
      );
    });

    it("roundtrip through the schema", () => {
      const usdPerMeter = Unit.rate(Unit.custom("USD"), "Meters");
      const encoded = Schema.encodeSync(Unit.UnitFromString)(usdPerMeter);

      assertEquals(encoded, "([USD]/Meters)");
      assertTrue(
        Equal.equals(
          Schema.decodeSync(Unit.UnitFromString)(encoded),
          usdPerMeter,
        ),
      );
    });

    it("Unit validates the id", () => {
      assertTrue(Schema.is(Unit.Unit)({ _tag: "Custom", id: "USD" }));
      assertFalse(Schema.is(Unit.Unit)({ _tag: "Custom", id: "not valid!" }));
      assertFalse(Schema.is(Unit.Unit)({ _tag: "Custom", id: 1 }));
    });

    it("custom throws on invalid ids", () => {
      throws(() => Unit.custom(""));
      throws(() => Unit.custom("US D"));
      throws(() => Unit.custom("US/D"));
      throws(() => Unit.custom("1USD"));
      throws(() => Unit.custom("[USD]"));
    });

    it("inspect as their canonical encoding", () => {
      assertEquals(Unit.custom("USD").toString(), "[USD]");
      assertEquals(JSON.stringify(Unit.custom("USD")), '"[USD]"');
    });
  });

  it("composite units inspect as their canonical encoding", () => {
    const metersPerSecond = Unit.rate("Meters", "Seconds");

    assertEquals(metersPerSecond.toString(), "(Meters/Seconds)");
    assertEquals(JSON.stringify(metersPerSecond), '"(Meters/Seconds)"');
    assertEquals(
      JSON.stringify(newtons),
      '"(Kilograms*((Meters/Seconds)/Seconds))"',
    );
  });
});
