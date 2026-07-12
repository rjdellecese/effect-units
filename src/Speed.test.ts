import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Duration from "./Duration";
import * as Length from "./Length";
import * as Quantity from "./Quantity";
import * as Speed from "./Speed";

describe("Speed", () => {
  const roundtrip = [
    { there: Speed.metersPerSecond, back: Speed.inMetersPerSecond },
    { there: Speed.kilometersPerHour, back: Speed.inKilometersPerHour },
    { there: Speed.feetPerSecond, back: Speed.inFeetPerSecond },
    { there: Speed.milesPerHour, back: Speed.inMilesPerHour },
  ];

  roundtrip.forEach(({ there, back }) => {
    it(`roundtrips between '${there.name}' and '${back.name}'`, () => {
      FastCheck.assert(
        FastCheck.property(Arbitrary.make(Schema.BigDecimal), (n) => {
          const roundTripped = pipe(n, there, back);

          return assertEquals(roundTripped, n);
        }),
      );
    });
  });

  it("is a length per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Length.meters(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Speed.metersPerSecond(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("travels a length over a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.at(
          Speed.metersPerSecond(BigDecimal.fromBigInt(5n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Length.meters(BigDecimal.fromBigInt(10n)),
      ),
    );
  });

  // The kilometers-per-hour factor (1000/3600) is non-terminating, so this
  // identity holds to the precision of the rounded constant (~100 digits)
  // rather than exactly.
  it("relates kilometers per hour to kilometers and hours to ~100 digits", () => {
    const distance = Quantity.at(
      Speed.kilometersPerHour(BigDecimal.fromBigInt(90n)),
      Duration.hours(BigDecimal.fromBigInt(2n)),
    );
    const difference = BigDecimal.abs(
      BigDecimal.subtract(
        Length.inKilometers(distance),
        BigDecimal.fromBigInt(180n),
      ),
    );

    assertTrue(BigDecimal.lessThan(difference, BigDecimal.make(1n, 90)));
  });

  it("relates miles per hour to meters per second exactly", () => {
    assertEquals(
      Speed.inMetersPerSecond(Speed.milesPerHour(BigDecimal.fromBigInt(1n))),
      BigDecimal.make(44704n, 5),
    );
  });
});
