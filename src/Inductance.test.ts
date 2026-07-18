import { describe } from "@effect/vitest";

import * as Inductance from "./Inductance";
import { testRoundtrips } from "./internal/testUtils";

describe("Inductance", () => {
  testRoundtrips([
    [Inductance.henries, Inductance.inHenries],
    [Inductance.nanohenries, Inductance.inNanohenries],
    [Inductance.microhenries, Inductance.inMicrohenries],
    [Inductance.millihenries, Inductance.inMillihenries],
    [Inductance.kilohenries, Inductance.inKilohenries],
  ]);
});
