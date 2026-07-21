import { describe } from "@effect/vitest";

import * as Charge from "../src/Charge.ts";
import { testAnchors, testRoundtrips } from "./testUtils.ts";

describe("Charge", () => {
  testRoundtrips([
    [Charge.coulombs, Charge.inCoulombs],
    [Charge.ampereHours, Charge.inAmpereHours],
    [Charge.milliampereHours, Charge.inMilliampereHours],
  ]);

  testAnchors(Charge.inCoulombs, [
    [Charge.ampereHours, 3600],
    [Charge.milliampereHours, 3.6],
  ]);
});
