import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Either from "effect/Either";
import * as Equal from "effect/Equal";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as Unit from "./Unit";

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
    assertTrue(
      !Equal.equals(
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
    ];

    for (const input of invalid) {
      assertTrue(Option.isNone(Unit.decode(input)));
    }
  });

  it("roundtrips through the schema", () => {
    const encoded = Schema.encodeSync(Unit.Unit)(newtons);

    assertEquals(encoded, "(Kilograms*((Meters/Seconds)/Seconds))");
    assertTrue(Equal.equals(Schema.decodeSync(Unit.Unit)(encoded), newtons));
  });

  it("the schema rejects non-canonical strings", () => {
    assertTrue(
      Either.isLeft(Schema.decodeEither(Unit.Unit)("(Meters/Seconds")),
    );
  });
});
