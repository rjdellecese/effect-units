import { describe } from "@effect/vitest";

import * as Inductance from "../src/Inductance.ts";
import { testAnchors, testRoundtrips } from "./testUtils.ts";

describe("Inductance", () => {
  testRoundtrips([
    [Inductance.henries, Inductance.inHenries],
    [Inductance.nanohenries, Inductance.inNanohenries],
    [Inductance.microhenries, Inductance.inMicrohenries],
    [Inductance.millihenries, Inductance.inMillihenries],
    [Inductance.kilohenries, Inductance.inKilohenries],
  ]);

  testAnchors(Inductance.inHenries, [
    [Inductance.nanohenries, 1e-9],
    [Inductance.microhenries, 1e-6],
    [Inductance.millihenries, 1e-3],
    [Inductance.kilohenries, 1e3],
  ]);
});
