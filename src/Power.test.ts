import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Duration from "./Duration";
import * as Energy from "./Energy";
import * as Power from "./Power";
import * as Quantity from "./Quantity";

describe("Power", () => {
  const roundtrip = [
    { there: Power.watts, back: Power.inWatts },
    { there: Power.kilowatts, back: Power.inKilowatts },
    { there: Power.megawatts, back: Power.inMegawatts },
    { there: Power.metricHorsepower, back: Power.inMetricHorsepower },
    { there: Power.mechanicalHorsepower, back: Power.inMechanicalHorsepower },
    { there: Power.electricalHorsepower, back: Power.inElectricalHorsepower },
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

  it("is an energy per a duration", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          Energy.joules(BigDecimal.fromBigInt(10n)),
          Duration.seconds(BigDecimal.fromBigInt(2n)),
        ),
        Power.watts(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("relates kilowatts and hours to kilowatt hours", () => {
    assertTrue(
      Equal.equals(
        Quantity.at(
          Power.kilowatts(BigDecimal.fromBigInt(2n)),
          Duration.hours(BigDecimal.fromBigInt(3n)),
        ),
        Energy.kilowattHours(BigDecimal.fromBigInt(6n)),
      ),
    );
  });
});
