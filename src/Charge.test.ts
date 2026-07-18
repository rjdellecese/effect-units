import { describe } from "@effect/vitest";

import * as Charge from "./Charge";
import { testRoundtrips } from "./internal/testUtils";

describe("Charge", () => {
  testRoundtrips([
    [Charge.coulombs, Charge.inCoulombs],
    [Charge.ampereHours, Charge.inAmpereHours],
    [Charge.milliampereHours, Charge.inMilliampereHours],
  ]);
});
