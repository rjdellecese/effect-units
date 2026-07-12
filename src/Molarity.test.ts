import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as BigDecimal from "effect/BigDecimal";
import * as Equal from "effect/Equal";
import * as FastCheck from "effect/FastCheck";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";

import * as Molarity from "./Molarity";
import * as Quantity from "./Quantity";
import * as SubstanceAmount from "./SubstanceAmount";
import * as Volume from "./Volume";

describe("Molarity", () => {
  const roundtrip = [
    { there: Molarity.molesPerCubicMeter, back: Molarity.inMolesPerCubicMeter },
    { there: Molarity.molesPerLiter, back: Molarity.inMolesPerLiter },
    { there: Molarity.decimolesPerLiter, back: Molarity.inDecimolesPerLiter },
    { there: Molarity.centimolesPerLiter, back: Molarity.inCentimolesPerLiter },
    { there: Molarity.millimolesPerLiter, back: Molarity.inMillimolesPerLiter },
    { there: Molarity.micromolesPerLiter, back: Molarity.inMicromolesPerLiter },
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

  it("is a substance amount per a volume", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          SubstanceAmount.moles(BigDecimal.fromBigInt(10n)),
          Volume.cubicMeters(BigDecimal.fromBigInt(2n)),
        ),
        Molarity.molesPerCubicMeter(BigDecimal.fromBigInt(5n)),
      ),
    );
  });

  it("relates moles per liter to moles and liters", () => {
    assertTrue(
      Equal.equals(
        Quantity.unsafePer(
          SubstanceAmount.moles(BigDecimal.fromBigInt(1n)),
          Volume.liters(BigDecimal.fromBigInt(1n)),
        ),
        Molarity.molesPerLiter(BigDecimal.fromBigInt(1n)),
      ),
    );
  });
});
