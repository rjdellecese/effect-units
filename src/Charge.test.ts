import { describe } from "@effect/vitest";

import * as Charge from "./Charge";
import { testRoundtrip } from "./internal/testUtils";

describe("Charge", () => {
  testRoundtrip(Charge.coulombs, Charge.inCoulombs);
  testRoundtrip(Charge.ampereHours, Charge.inAmpereHours);
  testRoundtrip(Charge.milliampereHours, Charge.inMilliampereHours);
});
