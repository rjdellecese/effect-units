import { describe, it } from "@effect/vitest";
import { assertEquals, assertTrue } from "@effect/vitest/utils";
import * as BigDecimal from "effect/BigDecimal";

import { pi } from "./constants";

describe("pi", () => {
  it("has 100 decimal places", () => {
    assertEquals(pi.scale, 100);
    assertEquals(BigDecimal.normalize(pi).scale, 100);
  });

  it("agrees with Math.PI to float precision", () => {
    const floatPi = BigDecimal.unsafeFromNumber(Math.PI);
    const difference = BigDecimal.abs(BigDecimal.subtract(pi, floatPi));

    assertTrue(BigDecimal.lessThan(difference, BigDecimal.make(1n, 15)));
  });
});
