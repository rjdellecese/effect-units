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

| Module                       | Role                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `effect-units/Quantity`      | Typed quantity values with arithmetic and unit algebra (`times`, `squared`, `cubed`, `per`, `at`, `over`, ...) |
| `effect-units/ExactQuantity` | The exact counterpart of `Quantity`: rational-valued, same algebra, division returns `Option`                  |
| `effect-units/Rational`      | Arbitrary-precision rationals (reduced bigint fractions) in the `effect/BigDecimal` idiom                      |
| `effect-units/Unit`          | Unit trees: base units (built-in or custom) composed with `Product` and `Rate`                                 |
| `effect-units/Prefix`        | SI prefixes                                                                                                    |

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

### Exact units

Every unit module above whose conversion factors are exact rationals has an
exact twin named with an `Exact` prefix (`effect-units/ExactLength`,
`effect-units/ExactSpeed`, `effect-units/ExactTemperature`, ...), taking and
returning `Rational` values with lossless conversions. The rule for what has
a twin: **if a conversion factor involves π, it stays float-only.** That
excludes `Angle`, `AngularSpeed`, `AngularAcceleration`, and `SolidAngle`
entirely, `parsecs` within `ExactLength`, and `footLamberts` within
`ExactLuminance` — everything else converts exactly (an exact US liquid
gallon is _exactly_ 231 cubic inches; 212 °F is _exactly_ 100 °C).

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

Precision: integer minor units are exact in float64 up to
`Number.MAX_SAFE_INTEGER` (2^53 − 1) cents, but rate arithmetic (`per`,
`at`, ...) is ordinary IEEE 754 division and multiplication — measurement
semantics, not accounting semantics. Keep your money library as the system
of record: round explicitly when converting a computed quantity back (or
raise the dinero `scale` to keep sub-minor-unit precision), and reject
amounts beyond the safe-integer range (e.g. from dinero's bigint
calculator) at the boundary rather than letting them degrade silently. See
`test/CustomUnits.test.ts` for a boundary that does both — or use
`ExactQuantity` for money instead, where none of these caveats apply (see
below).

## Exact quantities

`ExactQuantity` is the exact interpreter of the same unit algebra: the
value is a `Rational` (an arbitrary-precision reduced fraction of bigints),
so sums, products, and — crucially — rates lose nothing. `$2 per 3 meters`
_is_ 200/3 cents per meter, and applying that rate to 3 meters recovers
exactly $2:

```ts
import * as ExactLength from "effect-units/ExactLength";
import * as ExactQuantity from "effect-units/ExactQuantity";
import * as Rational from "effect-units/Rational";
import * as Unit from "effect-units/Unit";

const Usd = Unit.custom("USD");
const cents = (r: Rational.Rational) => ExactQuantity.make(Usd, r);

const rate = ExactQuantity.unsafePer(
  cents(Rational.unsafeMake(200n)),
  ExactLength.meters(Rational.unsafeMake(3n)),
); // exactly 200/3 cents per meter

const cost = ExactQuantity.at(
  rate,
  ExactLength.meters(Rational.unsafeMake(3n)),
);
// exactly 200 cents — Equal.equals, not isCloseTo
```

Because ℚ has no infinities or NaN, partiality lives in the types instead
of sentinel values: `per`, `at_`, `over`, `over_`, `divide`, and
`Rational.reciprocal` return `Option` (`Option.none()` exactly when the
divisor is zero), each with an `unsafe*` twin that throws. Everything else
— `sum`, `subtract`, `multiply`, `times`, `squared`, `cubed`, `at`,
`for_`, comparisons — is total and exact, `equals` is decidable, and
quantities are safe `HashMap` keys with no NaN or -0 caveats.

Rounding happens only at explicitly parameterized boundaries:

- `ExactQuantity.fromQuantity` (float → exact) is **lossless** — every
  finite double is a dyadic rational; NaN/±Infinity give `Option.none()`.
- `ExactQuantity.toQuantity` (exact → float) is **one correct rounding**.
- `Rational.toBigDecimal({ scale, mode })` and `Rational.round({ mode })`
  name their rounding at the call site, using `effect/BigDecimal`'s
  `RoundingMode` vocabulary — the right way out to a money library like
  dinero.js (see `test/ExactCustomUnits.test.ts`).
- `ExactDuration` converts to and from `effect/Duration` exactly
  (nanosecond bigints are rationals) and rounds explicitly for
  millisecond-resolution `DateTime`.

The wire format is `{ unit, value }` with the value as a canonical fraction
string (`"200/3"`, `"3"`) — exact on the wire, no width ceiling. The cost
of exactness is that values grow: every operation reduces by gcd, but sums
over unrelated denominators genuinely accumulate size, and rational
arithmetic is slower than floats. Use `Quantity` for measurement and
simulation; use `ExactQuantity` where a lost cent (or a lost nanosecond)
is a bug.

## Numbers, precision, and equality

The library is two-track: `Quantity` values are plain 64-bit floats (as in
`elm-units`) with measurement semantics, and `ExactQuantity` values are
arbitrary-precision rationals with accounting/algebraic semantics. The two
tracks agree at every conversion factor: each float factor is the correctly
rounded float of its exact defining rational (asserted bit-for-bit against
the exact modules in the test suite), and no float module imports any
bigint code. What remains float-only is _arithmetic on runtime values_ —
e.g. the float `Temperature.degreesFahrenheit` rounds per operation as any
float affine map must, where `ExactTemperature` is exact.

On the float track, arithmetic follows IEEE 754 semantics: division by
zero yields ±Infinity, invalid operations yield NaN, and every operation
carries ordinary float rounding (~15-16 significant digits). Check results
with `Quantity.isNaN`, `isInfinite`, and `isFinite`.

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
