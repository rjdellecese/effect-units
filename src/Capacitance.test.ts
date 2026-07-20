import { describe } from "@effect/vitest";

import * as Capacitance from "./Capacitance.ts";
import { testAnchors, testRoundtrips } from "../test/testUtils.ts";

describe("Capacitance", () => {
  testRoundtrips([
    [Capacitance.farads, Capacitance.inFarads],
    [Capacitance.picofarads, Capacitance.inPicofarads],
    [Capacitance.nanofarads, Capacitance.inNanofarads],
    [Capacitance.microfarads, Capacitance.inMicrofarads],
  ]);

  testAnchors(Capacitance.inFarads, [
    [Capacitance.picofarads, 1e-12],
    [Capacitance.nanofarads, 1e-9],
    [Capacitance.microfarads, 1e-6],
  ]);
});
