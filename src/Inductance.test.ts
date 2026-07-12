import { describe } from "@effect/vitest";

import * as Inductance from "./Inductance";
import { testRoundtrip } from "./internal/testUtils";

describe("Inductance", () => {
  testRoundtrip(Inductance.henries, Inductance.inHenries);
  testRoundtrip(Inductance.nanohenries, Inductance.inNanohenries);
  testRoundtrip(Inductance.microhenries, Inductance.inMicrohenries);
  testRoundtrip(Inductance.millihenries, Inductance.inMillihenries);
  testRoundtrip(Inductance.kilohenries, Inductance.inKilohenries);
});
