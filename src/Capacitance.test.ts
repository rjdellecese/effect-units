import { describe } from "@effect/vitest";

import * as Capacitance from "./Capacitance";
import { testRoundtrip } from "./internal/testUtils";

describe("Capacitance", () => {
  testRoundtrip(Capacitance.farads, Capacitance.inFarads);
  testRoundtrip(Capacitance.picofarads, Capacitance.inPicofarads);
  testRoundtrip(Capacitance.nanofarads, Capacitance.inNanofarads);
  testRoundtrip(Capacitance.microfarads, Capacitance.inMicrofarads);
});
