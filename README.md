# effect-units

Typed quantities and unit conversions for [Effect](https://effect.website).

A port of Elm's [`ianmackenzie/elm-units`](https://package.elm-lang.org/packages/ianmackenzie/elm-units/latest/) for [Effect](https://effect.website).

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

| Module                  | Role                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `effect-units/Quantity` | Typed quantity values with arithmetic and unit algebra (`times`, `squared`, `cubed`, `per`, `at`, `over`, ...) |
| `effect-units/Unit`     | Unit trees: base units composed with `Product` and `Rate`                                                      |
| `effect-units/Prefix`   | SI prefixes                                                                                                    |

### Units

| Module                             | Underlying units                                                         |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `effect-units/Length`              | `Meters`                                                                 |
| `effect-units/Duration`            | `Seconds` (with `effect/Duration` and `effect/DateTime` interop)         |
| `effect-units/Mass`                | `Kilograms`                                                              |
| `effect-units/Angle`               | `Radians` (with DMS conversion and trigonometry)                         |
| `effect-units/Area`                | `Squared<Meters>`                                                        |
| `effect-units/Volume`              | `Cubed<Meters>`                                                          |
| `effect-units/Speed`               | `Rate<Meters, Seconds>`                                                  |
| `effect-units/Acceleration`        | `Rate<MetersPerSecond, Seconds>`                                         |
| `effect-units/AngularSpeed`        | `Rate<Radians, Seconds>`                                                 |
| `effect-units/AngularAcceleration` | `Rate<RadiansPerSecond, Seconds>`                                        |
| `effect-units/Force`               | `Product<Kilograms, MetersPerSecondSquared>`                             |
| `effect-units/Energy`              | `Product<Newtons, Meters>`                                               |
| `effect-units/Torque`              | `Product<Newtons, Meters>` (same as energy, as in `elm-units`)           |
| `effect-units/Power`               | `Rate<Joules, Seconds>`                                                  |
| `effect-units/Pressure`            | `Rate<Newtons, SquareMeters>`                                            |
| `effect-units/Density`             | `Rate<Kilograms, CubicMeters>`                                           |
| `effect-units/Charge`              | `Coulombs`                                                               |
| `effect-units/Current`             | `Rate<Coulombs, Seconds>`                                                |
| `effect-units/Voltage`             | `Rate<Watts, Amperes>`                                                   |
| `effect-units/Resistance`          | `Rate<Volts, Amperes>`                                                   |
| `effect-units/Capacitance`         | `Farads`                                                                 |
| `effect-units/Inductance`          | `Henries`                                                                |
| `effect-units/SolidAngle`          | `Steradians`                                                             |
| `effect-units/LuminousFlux`        | `Lumens`                                                                 |
| `effect-units/LuminousIntensity`   | `Rate<Lumens, Steradians>`                                               |
| `effect-units/Illuminance`         | `Rate<Lumens, SquareMeters>`                                             |
| `effect-units/Luminance`           | `Rate<Candelas, SquareMeters>`                                           |
| `effect-units/SubstanceAmount`     | `Moles`                                                                  |
| `effect-units/Molarity`            | `Rate<Moles, CubicMeters>`                                               |
| `effect-units/Pixels`              | `Pixels` (screen space), plus pixel rates and areas                      |
| `effect-units/Temperature`         | Absolute `Temperature` (kelvins) and relative `Delta` (`CelsiusDegrees`) |

## Example

```ts
import * as Duration from "effect-units/Duration";
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";
import * as Speed from "effect-units/Speed";

const height = Length.centimeters(180);
const inInches = Length.inInches(height);

const area = Quantity.times(height, height); // Quantity<Squared<"Meters">>

const speed = Quantity.per(Length.miles(3), Duration.hours(1)); // Quantity<Rate<"Meters", "Seconds">>, usable as a Speed

const distance = Quantity.at(speed, Duration.minutes(20));
```

## Numbers, precision, and equality

Values are plain 64-bit floats (as in `elm-units`), and arithmetic follows
IEEE 754 semantics: division by zero yields ±Infinity, invalid operations
yield NaN, and every operation carries ordinary float rounding (~15-16
significant digits). Check results with `Quantity.isNaN`, `isInfinite`, and
`isFinite`.

Equality is two-tier:

- `Equal.equals` / `Quantity.equals` is **exact** — identical value (NaN
  equals itself; -0 is normalized to 0) and structurally equal units. This
  is identity, suitable for `HashMap` keys, not for comparing computed
  measurements.
- `Quantity.equalsWithin(a, b, tolerance)` is the domain-level comparison —
  the tolerance is itself a quantity in the same units, e.g.
  `Quantity.equalsWithin(a, b, Length.millimeters(1))`. Identical values —
  including two equal infinities — are equal within any tolerance; NaN is
  never equal to anything.

The ordering predicates (`lessThan`, `greaterThan`, ...) follow IEEE NaN
semantics: any comparison involving NaN is false. `min` and `max` propagate
NaN deterministically, like `Math.min`/`Math.max`.

While in-memory arithmetic produces NaN and ±Infinity freely, the wire
format does not admit them: schemas reject non-finite values at encode
(where JSON would silently turn them into `null`) and at decode.

## Scripts

```bash
pnpm install
pnpm test
pnpm build
```
