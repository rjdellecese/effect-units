# effect-units

Typed quantities and unit conversions for [Effect](https://effect.website), ported from Elm's [`ianmackenzie/elm-units`](https://package.elm-lang.org/packages/ianmackenzie/elm-units/latest/).

Store, pass around, convert between, compare, and do arithmetic on lengths, durations, speeds, temperatures, pixels, money, and dozens of other kinds of quantity—with the type system checking your units and your dimensional analysis at every step.

## Highlights

### Never mix up units again

A quantity is a number tagged with a unit at the type level. Values are stored in SI base units, so constructing and converting in any unit you like is just a function call—and combining quantities whose units don't agree doesn't typecheck:

```ts
import * as Duration from "effect-units/Duration";
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";

const marathon = Length.miles(26.2); // a Length — Quantity<"Meters">
Length.inFeet(marathon); // 138336
Length.inKilometers(marathon); // 42.1648128

const record = Duration.hours(2.001); // a Duration — Quantity<"Seconds">

Quantity.sum(marathon, Length.kilometers(1)); // fine: both are lengths
marathon.pipe(Quantity.sum(record)); // ✗ compile error: meters + seconds
```

### The type system checks your dimensional analysis

`times`, `squared`, `per`, `at`, and friends compose units into products and rates, and the result types follow along. Divide a length by a duration and you have a speed; apply that speed to a duration and you're back to a length:

```ts
import * as Speed from "effect-units/Speed";

const speed = Quantity.per(Length.miles(3), Duration.hours(1));
// Quantity<Rate<"Meters", "Seconds">> — a Speed

Speed.inKilometersPerHour(speed); // 4.828032

const distance = Quantity.at(speed, Duration.minutes(20));
// Quantity<"Meters"> — a Length

Length.inMiles(distance); // 1

Quantity.at(speed, Length.meters(5)); // ✗ compile error: a speed applies to a duration, not a length
```

The derived quantities you'd reach for—`Area`, `Speed`, `Force`, `Energy`, `Power`, `Pressure`, and many more—are names for exactly these compositions, each with its own module of conversions (see [Modules](#modules)).

### Custom units compose like built-in ones

The built-in base units cover physics, but a custom unit—`USD`, tiles in a game, requests—is a first-class leaf of the unit tree and participates in all the same algebra:

```ts
import * as Unit from "effect-units/Unit";

const Usd = Unit.custom("USD");
const cents = (n: number) => Quantity.make(Usd, n);

const price = Quantity.per(cents(300), Length.meters(2));
// Quantity<Rate<Custom<"USD">, "Meters">> — cents per meter

const cost = Quantity.at(price, Length.meters(10)); // 1500 cents
```

See [Custom units](#custom-units) for the full pattern, including a lossless boundary with money libraries like dinero.js.

### Effect-native, wire-ready

Quantities are Effect value objects: `Equal` and `Hash` (safe `HashMap` keys), `Pipeable`, with dual data-first/data-last functions throughout. Every quantity module exports a `Schema` with a stable, self-describing wire format—one that rejects NaN and ±Infinity at the boundary instead of letting JSON silently turn them into `null`:

```ts
import * as Schema from "effect/Schema";

Schema.encodeSync(Speed.Speed)(speed);
// { unit: "(Meters/Seconds)", value: 1.34112 }
```

`Duration` interoperates with `effect/Duration` and `effect/DateTime`, and `Rational` follows the `effect/BigDecimal` idiom.

### Exact arithmetic, when a lost cent is a bug

Floats are right for measurement; money and time often want exactness. `QuantityExact` runs the same unit algebra over arbitrary-precision rationals: sums, products, and—crucially—rates lose nothing, and partiality moves into the types (`Option` instead of NaN or ±Infinity). Equality is decidable, so you can say things like:

```ts
import * as Equal from "effect/Equal";
import * as Rational from "effect-units/Rational";
import * as TemperatureExact from "effect-units/TemperatureExact";

Equal.equals(
  TemperatureExact.degreesFahrenheit(Rational.fromBigInt(212n)),
  TemperatureExact.degreesCelsius(Rational.fromBigInt(100n)),
); // true — exactly, not within a tolerance
```

Nearly every unit module has an exact twin (`LengthExact`, `SpeedExact`, `DurationExact`, …) with lossless conversion factors, and the two tracks agree bit-for-bit on every factor. See [Exact quantities](#exact-quantities).

## Install

```bash
pnpm add effect-units
```

## Modules

### Core

| Module | Role |
| --- | --- |
| `effect-units/Quantity` | Typed quantity values with arithmetic and unit algebra (`times`, `squared`, `cubed`, `per`, `at`, `over`, …) |
| `effect-units/QuantityExact` | The exact counterpart of `Quantity`: rational-valued, same algebra, division returns `Option` |
| `effect-units/Rational` | Arbitrary-precision rationals (reduced bigint fractions) in the `effect/BigDecimal` idiom |
| `effect-units/Unit` | Unit trees: base units (built-in or custom) composed with `Product` and `Rate` |
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

### Exact units

Nearly every unit module above has an exact twin named with an `Exact` suffix (`effect-units/LengthExact`, `effect-units/SpeedExact`, `effect-units/TemperatureExact`, …), taking and returning `Rational` values with lossless conversions. The rule for what gets a twin: **if a conversion factor involves π, it stays float-only.** That excludes `Angle`, `AngularSpeed`, `AngularAcceleration`, and `SolidAngle` entirely, plus `parsecs` within `LengthExact` and `footLamberts` within `LuminanceExact`. Everything else converts exactly: a US liquid gallon is _exactly_ 231 cubic inches, and 212 °F is _exactly_ 100 °C.

## Custom units

The built-in base units are a closed set, but you can define your own with `Unit.custom`—a custom unit is a leaf of the unit tree, just like `"Meters"`, and composes freely with `Product` and `Rate`. Write a module for it the same way the library's own unit modules are written:

```ts
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";
import * as Unit from "effect-units/Unit";

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = Quantity.Quantity<Usd>;
const Money = Quantity.Quantity(Usd); // Schema, wire format { unit: "[USD]", value: n }

// Store minor units (cents), so money libraries like dinero.js—which
// represent amounts as integer minor units—convert losslessly at the
// boundary. The quantity's value is always a number.
const cents = (n: number): Money => Quantity.make(Usd, n);
const dollars = (n: number): Money => cents(n * 100);
const inDollars = (m: Money): number => m.value / 100;

const pricePerMeter = Quantity.per(dollars(3), Length.meters(2)); // Quantity<Rate<Custom<"USD">, "Meters">>

const cost = Quantity.at(pricePerMeter, Length.meters(10)); // Quantity<Custom<"USD">>
inDollars(cost); // 15
```

Ids must match `/^[A-Za-z][A-Za-z0-9]*$/` (`Unit.custom` throws otherwise), and encode in bracketed form—`"[USD]"`, `"([USD]/Meters)"`—so they can never collide with built-in names on the wire. A custom unit is always distinct from a built-in base unit with the same name: `Unit.custom("Meters")` is not `"Meters"`.

Precision: integer minor units are exact in float64 up to `Number.MAX_SAFE_INTEGER` (2^53 − 1) cents, but rate arithmetic (`per`, `at`, …) is ordinary IEEE 754 division and multiplication—measurement semantics, not accounting semantics. Keep your money library as the system of record: round explicitly when converting a computed quantity back (or raise the dinero `scale` to keep sub-minor-unit precision), and reject amounts beyond the safe-integer range at the boundary rather than letting them degrade silently—`test/CustomUnits.test.ts` shows a boundary that does both. Or use `QuantityExact` for money instead, where none of these caveats apply (see below).

## Exact quantities

`QuantityExact` is the exact interpreter of the same unit algebra: the value is a `Rational` (an arbitrary-precision reduced fraction of bigints), so sums, products, and—crucially—rates lose nothing. `$2 per 3 meters` _is_ 200/3 cents per meter, and applying that rate to 3 meters recovers exactly $2:

```ts
import * as LengthExact from "effect-units/LengthExact";
import * as QuantityExact from "effect-units/QuantityExact";
import * as Rational from "effect-units/Rational";
import * as Unit from "effect-units/Unit";

const Usd = Unit.custom("USD");
const cents = (r: Rational.Rational) => QuantityExact.make(Usd, r);

const rate = QuantityExact.unsafePer(
  cents(Rational.unsafeMake(200n)),
  LengthExact.meters(Rational.unsafeMake(3n)),
); // exactly 200/3 cents per meter

const cost = QuantityExact.at(
  rate,
  LengthExact.meters(Rational.unsafeMake(3n)),
);
// exactly 200 cents—Equal.equals, not isCloseTo
```

Because ℚ has no infinities or NaN, partiality lives in the types instead of sentinel values: `per`, `at_`, `over`, `over_`, `divide`, and `Rational.reciprocal` return `Option` (`Option.none()` exactly when the divisor is zero), each with an `unsafe*` twin that throws. Everything else—`sum`, `subtract`, `multiply`, `times`, `squared`, `cubed`, `at`, `for_`, comparisons—is total and exact. `equals` is decidable, and quantities are safe `HashMap` keys with no NaN or -0 caveats.

Rounding happens only at explicitly parameterized boundaries:

- `QuantityExact.fromQuantity` (float → exact) is **lossless**—every finite double is a dyadic rational; NaN/±Infinity give `Option.none()`.
- `QuantityExact.toQuantity` (exact → float) is **one correct rounding**.
- `Rational.toBigDecimal({ scale, mode })` and `Rational.round({ mode })` name their rounding at the call site, using `effect/BigDecimal`'s `RoundingMode` vocabulary—the right way out to a money library like dinero.js (see `test/CustomUnitsExact.test.ts`).
- `DurationExact` converts to and from `effect/Duration` exactly (nanosecond bigints are rationals) and rounds explicitly for millisecond-resolution `DateTime`.

The wire format is `{ unit, value }` with the value as a canonical fraction string (`"200/3"`, `"3"`)—exact on the wire, no width ceiling. The cost of exactness is that values grow: every operation reduces by gcd, but sums over unrelated denominators genuinely accumulate size, and rational arithmetic is slower than floats. Use `Quantity` for measurement and simulation; use `QuantityExact` where a lost cent (or a lost nanosecond) is a bug.

## Numbers, precision, and equality

The library is two-track: `Quantity` values are plain 64-bit floats (as in `elm-units`) with measurement semantics, and `QuantityExact` values are arbitrary-precision rationals with accounting/algebraic semantics. The two tracks agree at every conversion factor: each float factor is the correctly rounded float of its exact defining rational, asserted bit-for-bit against the exact modules in the test suite. No float module imports any bigint code, so using only the float track loads no rational arithmetic. Where the tracks differ is _arithmetic on runtime values_: the float `Temperature.degreesFahrenheit` rounds at every operation, as any float affine map must, while `TemperatureExact` is exact.

On the float track, arithmetic follows IEEE 754 semantics: division by zero yields ±Infinity, invalid operations yield NaN, and every operation carries ordinary float rounding (~15-16 significant digits). Check results with `Quantity.isNaN`, `isInfinite`, and `isFinite`.

Equality is two-tier:

- `Equal.equals`/`Quantity.equals` is **exact**—identical value (NaN equals itself; -0 is normalized to 0) and structurally equal units. This is identity, suitable for `HashMap` keys, not for comparing computed measurements.
- `Quantity.equalsWithin(a, b, tolerance)` is the domain-level comparison—the tolerance is itself a quantity in the same units, e.g. `Quantity.equalsWithin(a, b, Length.millimeters(1))`. Identical values—including two equal infinities—are equal within any tolerance; NaN is never equal to anything.

The ordering predicates (`lessThan`, `greaterThan`, …) follow IEEE NaN semantics: any comparison involving NaN is false. `min` and `max` propagate NaN deterministically, like `Math.min`/`Math.max`.

While in-memory arithmetic produces NaN and ±Infinity freely, the wire format does not admit them: schemas reject non-finite values at encode (where JSON would silently turn them into `null`) and at decode.
