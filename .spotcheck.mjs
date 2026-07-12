import * as BigDecimal from "effect/BigDecimal";
import * as Angle from "./dist/Angle.js";
import * as Length from "./dist/Length.js";
import * as Power from "./dist/Power.js";
import * as Pressure from "./dist/Pressure.js";
import * as Speed from "./dist/Speed.js";
import * as Temperature from "./dist/Temperature.js";

const n = (x) => BigDecimal.unsafeFromNumber(x);
const show = (bd) => BigDecimal.unsafeToNumber(bd);

console.log("1 m/s in mph        =", show(Speed.inMilesPerHour(Speed.metersPerSecond(n(1)))), "(expect ~2.2369363)");
console.log("1 psi in Pa         =", show(Pressure.inPascals(Pressure.poundsPerSquareInch(n(1)))), "(expect ~6894.7573)");
console.log("1 mech hp in W      =", show(Power.inWatts(Power.mechanicalHorsepower(n(1)))), "(expect ~745.69987)");
console.log("1 parsec in ly      =", show(Length.inLightYears(Length.parsecs(n(1)))), "(expect ~3.2615638)");
console.log("1 rad in degrees    =", show(Angle.inDegrees(Angle.radians(n(1)))), "(expect ~57.295780)");
console.log("100 C in F          =", show(Temperature.inDegreesFahrenheit(Temperature.degreesCelsius(n(100)))), "(expect 212)");
