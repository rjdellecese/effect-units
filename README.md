# effect-units

Typed quantities and unit conversions for [Effect](https://effect.website).

A port of Elm's [`ianmackenzie/elm-units`](https://package.elm-lang.org/packages/ianmackenzie/elm-units/latest/) built on `effect/BigDecimal`. Originally extracted from [globecommerce](https://github.com/GlobeCommerce/globecommerce)'s `@globecommerce/units` package.

## Install

```bash
pnpm add effect-units effect
```

Private GitHub install until published:

```bash
pnpm add github:rjdellecese/effect-units#main
```

## Modules

### Core

| Module | Role |
| --- | --- |
| `effect-units/Quantity` | Typed quantity values with arithmetic and unit algebra (`times`, `squared`, `cubed`, `per`, `at`, `over`, ...) |
| `effect-units/Unit` | Unit trees: base units composed with `Product` and `Rate` |
| `effect-units/Prefix` | SI prefixes |

### Units

| Module | Underlying units |
| --- | --- |
| `effect-units/Length` | `Meters` |
| `effect-units/Duration` | `Seconds` (with `effect/Duration` and `effect/DateTime` interop) |
| `effect-units/Mass` | `Kilograms` |
| `effect-units/Angle` | `Radians` (with DMS conversion and trigonometry) |
| `effect-units/Area` | `Squared<Meters>` |
| `effect-units/Volume` | `Cubed<Meters>` |
| `effect-units/Speed` | `Rate<Meters, Seconds>` |
| `effect-units/Acceleration` | `Rate<MetersPerSecond, Seconds>` |
| `effect-units/AngularSpeed` | `Rate<Radians, Seconds>` |
| `effect-units/AngularAcceleration` | `Rate<RadiansPerSecond, Seconds>` |
| `effect-units/Force` | `Product<Kilograms, MetersPerSecondSquared>` |
| `effect-units/Energy` | `Product<Newtons, Meters>` |
| `effect-units/Torque` | `Product<Newtons, Meters>` (same as energy, as in `elm-units`) |
| `effect-units/Power` | `Rate<Joules, Seconds>` |
| `effect-units/Pressure` | `Rate<Newtons, SquareMeters>` |
| `effect-units/Density` | `Rate<Kilograms, CubicMeters>` |
| `effect-units/Charge` | `Coulombs` |
| `effect-units/Current` | `Rate<Coulombs, Seconds>` |
| `effect-units/Voltage` | `Rate<Watts, Amperes>` |
| `effect-units/Resistance` | `Rate<Volts, Amperes>` |
| `effect-units/Capacitance` | `Farads` |
| `effect-units/Inductance` | `Henries` |
| `effect-units/SolidAngle` | `Steradians` |
| `effect-units/LuminousFlux` | `Lumens` |
| `effect-units/LuminousIntensity` | `Rate<Lumens, Steradians>` |
| `effect-units/Illuminance` | `Rate<Lumens, SquareMeters>` |
| `effect-units/Luminance` | `Rate<Candelas, SquareMeters>` |
| `effect-units/SubstanceAmount` | `Moles` |
| `effect-units/Molarity` | `Rate<Moles, CubicMeters>` |
| `effect-units/Pixels` | `Pixels` (screen space), plus pixel rates and areas |
| `effect-units/Temperature` | Absolute `Temperature` (kelvins) and relative `Delta` (`CelsiusDegrees`) |

## Example

```ts
import * as BigDecimal from "effect/BigDecimal";
import * as Duration from "effect-units/Duration";
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";
import * as Speed from "effect-units/Speed";

const height = Length.centimeters(BigDecimal.unsafeFromNumber(180));
const inInches = Length.inInches(height);

const area = Quantity.times(height, height); // Quantity<Squared<"Meters">>

const speed = Quantity.unsafePer(
  Length.miles(BigDecimal.unsafeFromNumber(3)),
  Duration.hours(BigDecimal.unsafeFromNumber(1)),
); // Quantity<Rate<"Meters", "Seconds">>, usable as a Speed

const distance = Quantity.at(speed, Duration.minutes(BigDecimal.unsafeFromNumber(20)));
```

## Precision

All values are `effect/BigDecimal`s, and every constructor/extractor pair
roundtrips **exactly** — including units whose conversion factors are
irrational (degrees, parsecs, ...) or non-terminating (kilometers per hour,
pounds per square inch, ...). Those factors are precomputed once per module
(π is stored to 100 decimal places in `effect-units/internal/constants`) and
used symmetrically, multiplying on the way in and dividing by the identical
constant on the way out.

Two boundaries are lossy by design:

- Cross-unit identities that pass through a rounded factor (e.g. 360 degrees
  vs. 1 turn) agree to roughly 100 significant digits rather than exactly.
- Trigonometry (`Angle.sin`, `SolidAngle.conical`, ...) and `DateTime`
  interop go through 64-bit floats.

## Scripts

```bash
pnpm install
pnpm test
pnpm build
```
