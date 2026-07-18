import { describe } from "@effect/vitest";

import * as Capacitance from "./Capacitance";
import { testRoundtrips } from "./internal/testUtils";

describe("Capacitance", () => {
  testRoundtrips([
    [Capacitance.farads, Capacitance.inFarads],
    [Capacitance.picofarads, Capacitance.inPicofarads],
    [Capacitance.nanofarads, Capacitance.inNanofarads],
    [Capacitance.microfarads, Capacitance.inMicrofarads],
  ]);
});
