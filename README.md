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
| `effect-units/Unit`     | Unit trees: base units (built-in or custom) composed with `Product` and `Rate`                                 |
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

## Custom units

The built-in base units are a closed set, but you can define your own with
`Unit.custom` — a custom unit is a leaf of the unit tree, just like
`"Meters"`, and composes freely with `Product` and `Rate`. Write a module
for it the same way the library's own unit modules are written:

```ts
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";
import * as Unit from "effect-units/Unit";

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = Quantity.Quantity<Usd>;
const Money = Quantity.Quantity(Usd); // Schema, wire format { unit: "[USD]", value: n }

// Store minor units (cents), so money libraries like dinero.js — which
// represent amounts as integer minor units — convert losslessly at the
// boundary. The quantity's value is always a number.
const cents = (n: number): Money => Quantity.make(Usd, n);
const dollars = (n: number): Money => cents(n * 100);
const inDollars = (m: Money): number => m.value / 100;

const pricePerMeter = Quantity.per(dollars(3), Length.meters(2)); // Quantity<Rate<Custom<"USD">, "Meters">>

const cost = Quantity.at(pricePerMeter, Length.meters(10)); // Quantity<Custom<"USD">>
inDollars(cost); // 15
```

Ids must match `/^[A-Za-z][A-Za-z0-9]*$/` (`Unit.custom` throws otherwise),
and encode in bracketed form — `"[USD]"`, `"([USD]/Meters)"` — so they can
never collide with built-in names on the wire. A custom unit is always
distinct from a built-in base unit with the same name:
`Unit.custom("Meters")` is not `"Meters"`.

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

## License

[BSD 3-Clause](./LICENSE). effect-units derives from
[`ianmackenzie/elm-units`](https://github.com/ianmackenzie/elm-units)
(copyright Ian Mackenzie, also BSD 3-Clause); its copyright notice is
retained in [LICENSE](./LICENSE).
