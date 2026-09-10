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

### Percentages are quantities too

A bare `number` never says which scale it's on—`0.5` or `50`?—so percentages get a unit of their own, and the operations that put quantities into and out of it:

```ts
import * as Dimensionless from "effect-units/Dimensionless";

const shrinkage = Dimensionless.percent(10); // Quantity<"Unitless">
Dimensionless.inBasisPoints(shrinkage); // 1000

const shrunk = Quantity.times(
  Length.meters(200),
  Dimensionless.complement(shrinkage),
);
Length.inMeters(shrunk); // 180 — still a Length, not a Product

const progress = Quantity.ratio(Length.meters(30), Length.kilometers(1));
Dimensionless.inPercent(progress); // 3 — dimensionless, whatever it was measured in
```

See [Dimensionless quantities](#dimensionless-quantities).

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

See [Custom units](#custom-units) for the persistent-ID contract and checked minor-unit boundaries. This float example illustrates unit algebra, not safe accounting arithmetic.

### Effect-native, wire-ready

Quantities are Effect value objects: `Equal` and `Hash` (safe `HashMap` keys), `Pipeable`, with dual data-first/data-last functions throughout. Every quantity module exports two schemas, following the Effect v4 naming convention: `Speed` is the identity schema (a `Speed` on both sides), and `SpeedFromStruct` is the codec for a stable, self-describing wire format—one that rejects NaN and ±Infinity at the boundary instead of letting JSON silently turn them into `null`:

```ts
import * as Schema from "effect/Schema";

Schema.encodeSync(Speed.SpeedFromStruct)(speed);
// { unit: "(Meters/Seconds)", value: 1.34112 }
```

That wire format is also each type's canonical JSON representation, so quantities serialize correctly when they're nested inside a schema of your own—no wrapper codec to remember:

```ts
const Trip = Schema.Struct({ name: Schema.String, distance: Length.Length });

Schema.encodeSync(Schema.toCodecJson(Trip))({
  name: "commute",
  distance: Length.meters(5),
});
// { name: "commute", distance: { unit: "Meters", value: 5 } }
```

Reach for `XFromStruct` when you want the precise `{ unit, value }` encoded type; reach for `Schema.toCodecJson` when the quantity is part of a larger structure (its encoded type is `Json`).

When a property test should cover what people type into a number input—not arbitrary reals—annotate the quantity schema with an integer-backed grid. Bounds are inclusive, and generated values remain exact multiples of `step` while shrinking. Dual, so `pipe(unit, Quantity.arbitraryOnGrid(options))` works as well:

```ts
import * as Quantity from "effect-units/Quantity";

const MeasuredLength = Length.Length.annotate(
  Quantity.arbitraryOnGrid(Length.Meters, {
    step: 0.01,
    min: 0,
    max: 100,
  }),
);
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
pnpm add effect-units effect@beta
```

`effect` is a peer dependency. This release targets Effect v4, which is still in beta—hence the `@beta` tag.

## Modules

### Core

| Module | Role |
| --- | --- |
| `effect-units/Quantity` | Typed quantity values with arithmetic and unit algebra (`times`, `squared`, `cubed`, `per`, `at`, `over`, `ratio`, …) |
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
| `effect-units/Dimensionless` | `Unitless` (percentages, per mille, basis points, parts per million and billion) |

### Exact units

Nearly every unit module above has an exact twin named with an `Exact` suffix (`effect-units/LengthExact`, `effect-units/SpeedExact`, `effect-units/TemperatureExact`, …), taking and returning `Rational` values with lossless conversions. The rule for what gets a twin: **if a conversion factor involves π, it stays float-only.** That excludes `Angle`, `AngularSpeed`, `AngularAcceleration`, and `SolidAngle` entirely, plus `parsecs` within `LengthExact` and `footLamberts` within `LuminanceExact`. Everything else converts exactly: a US liquid gallon is _exactly_ 231 cubic inches, and 212 °F is _exactly_ 100 °C.

## Schema boundaries

Use `Quantity.QuantityFromValue(unit)` when an existing wire format stores only a number and fixes the unit elsewhere. It decodes and encodes finite numbers, rejecting NaN and ±Infinity in both directions. The unit and its base scale are an out-of-band storage contract; this codec does not change the identity schema's canonical `{ unit, value }` JSON representation.

```ts
import * as Schema from "effect/Schema";
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";

const PositiveMeters = Quantity.positive(Quantity.QuantityFromValue("Meters"));
const NonNegativeLength = Quantity.nonNegative(Length.LengthFromStruct);
const AtLeastOneMeter = PositiveMeters.check(
  Quantity.greaterThanOrEqualTo(Length.meters(1)),
);

Schema.decodeSync(AtLeastOneMeter)(2); // Length.meters(2)
Schema.encodeSync(AtLeastOneMeter)(Length.meters(2)); // 2
Schema.encodeSync(NonNegativeLength)(Length.meters(0));
// { unit: "Meters", value: 0 }
```

`positive(schema, annotations?)` and `nonNegative(schema, annotations?)` preserve the input schema's encoded form and existing checks. `greaterThanOrEqualTo(bound, annotations?)` supplies an inclusive, same-unit check for `.check(...)`. These are value constraints, not arithmetic invariants or finiteness checks: identity schemas can still accept positive infinity, while the wire codecs reject it.

To reuse an existing input codec, compose Effect's `Schema.decodeTo` directly. Its original wire format, validation, and error messages remain at the boundary rather than being recreated in a wrapper API:

```ts
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";
import * as Quantity from "effect-units/Quantity";

const ExistingMeters = Schema.NumberFromString.check(
  Schema.isFinite(),
  Schema.isGreaterThan(0, { expected: "a positive distance in meters" }),
);
const Distance = ExistingMeters.pipe(
  Schema.decodeTo(
    Quantity.Quantity("Meters"),
    SchemaTransformation.transform({
      decode: (value) => Quantity.make("Meters", value),
      encode: (quantity) => quantity.value,
    }),
  ),
);

Schema.decodeSync(Distance)("2"); // Quantity.make("Meters", 2)
Schema.encodeSync(Distance)(Quantity.make("Meters", 2)); // "2"
```

## Decimal boundaries

`Quantity.fromBigDecimal(unit, decimal)` (also `fromBigDecimal(unit)(decimal)`) rounds a decimal in base units to a double once. `Quantity.toBigDecimal(quantity)` returns an `Option` containing the double's shortest round-tripping decimal, or `None` for NaN and ±Infinity. Overflow can produce infinity; underflow can produce zero. Inputs with at most 15 significant decimal digits round-trip **numerically** when their nonzero magnitude is in the finite normal double range—not for subnormals. This does not preserve trailing zeros or make later float arithmetic exact; use `QuantityExact` for accounting.

Shift decimal scales before crossing into floats, rather than multiplying a converted float by 100. For a cents-backed USD unit, dollars become cents by subtracting two from the decimal scale; the inverse shift happens after converting back:

```ts
import * as BigDecimal from "effect/BigDecimal";
import * as Option from "effect/Option";
import * as Quantity from "effect-units/Quantity";
import * as Unit from "effect-units/Unit";

const Usd = Unit.custom("USD");
const input = BigDecimal.fromStringUnsafe("4.25");
const amount = Quantity.fromBigDecimal(
  Usd,
  BigDecimal.make(input.value, input.scale - 2),
); // 425 cents
if (!Number.isSafeInteger(amount.value)) {
  throw new RangeError("Expected safe integer cents");
}
const output = Quantity.toBigDecimal(amount).pipe(
  Option.map((bd) => BigDecimal.make(bd.value, bd.scale + 2)),
); // Some(decimal 4.25 dollars)
```

The cent check can reject fractional or unsafe totals; it cannot detect every decimal that already rounded to a safe integer during conversion. Validate arbitrary-precision inputs before this lossy boundary when exact acceptance matters, and keep currency formatting and rounding as application policy. There is no scale option on the conversion API.

## Custom units

The built-in base units are a closed set, but you can define your own with `Unit.custom`—a custom unit is a leaf of the unit tree, just like `"Meters"`, and composes freely with `Product` and `Rate`.

### Persistent identity, not a display name

**The argument to `Unit.custom` is already a persistent ID.** Choose it like a database column name, not a UI label. Ids must match `/^[A-Za-z][A-Za-z0-9]*$/` (`Unit.custom` throws otherwise), and encode in bracketed form—`"[USD]"`, `"([USD]/Meters)"`—so they can never collide with built-in names on the wire. A custom unit is always distinct from a built-in base unit with the same name: `Unit.custom("Meters")` is not `"Meters"`.

You can rename a code binding or type alias without changing the ID. For example, replace a binding named `Units` with `Count`, but keep the literal `"Units"`:

```ts
import * as Schema from "effect/Schema";
import * as Quantity from "effect-units/Quantity";
import * as Unit from "effect-units/Unit";

type Count = Unit.Custom<"Units">;
const Count: Count = Unit.custom("Units");
const CountFromStruct = Quantity.QuantityFromStruct(Count);

const count = Schema.decodeSync(CountFromStruct)({
  unit: "[Units]",
  value: 3,
});
Schema.encodeSync(CountFromStruct)(count); // { unit: "[Units]", value: 3 }
```

Keep display labels in your application. Changing the literal to `"Count"` changes identity: the new `QuantityFromStruct` schema rejects old `"[Units]"` payloads. The same contract applies to exact quantities and derived units such as `"([USD]/[Units])"` or `"([Units]*Meters)"`.

The meaning of one base unit is also a wire contract. If `"[USD]"` counts cents, redefining it to count dollars silently changes the meaning of every stored value even though decoding still succeeds. Changing either an ID or a base scale needs an explicit migration: expand readers to accept the old and new contracts, convert and backfill stored values and tags, switch writers, then retire the old contract. Include derived products and rates: changing a numerator's scale affects its values differently from changing a denominator's scale, and repeated factors also matter. If changing scale, use a distinct versioned ID or an external payload version so readers can distinguish the representations; the unit string carries no scale metadata.

### Cents-backed USD with checked boundaries

Use the existing `Quantity.make`, `per`, and `at` APIs with an application-owned convention: one `"USD"` unit means one cent. No display-scale metadata or currency module is implied. Here is a small application recipe:

```ts
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";
import * as Unit from "effect-units/Unit";

type Usd = Unit.Custom<"USD">;
const Usd: Usd = Unit.custom("USD");

type Money = Quantity.Quantity<Usd>;
const MoneyFromStruct = Quantity.QuantityFromStruct(Usd); // wire format { unit: "[USD]", value: n }

const cents = (n: number): Money => {
  if (!Number.isSafeInteger(n)) {
    throw new RangeError("Expected safe integer cents");
  }
  return Quantity.make(Usd, n);
};
const dollars = (n: number): Money => {
  if (!Number.isSafeInteger(n)) {
    throw new RangeError(
      "Expected whole dollars; use cents for fractional dollars",
    );
  }
  return cents(n * 100);
};
const inCents = (m: Money): number => {
  if (!Number.isSafeInteger(m.value)) {
    throw new RangeError("Expected safe integer cents");
  }
  return m.value;
};
const inDollars = (m: Money): number => m.value / 100;

const pricePerMeter = Quantity.per(dollars(3), Length.meters(2)); // Quantity<Rate<Custom<"USD">, "Meters">>

const cost = Quantity.at(pricePerMeter, Length.meters(10)); // Quantity<Custom<"USD">>
inCents(cost); // 1500
inDollars(cost); // 15
```

Integer cents are represented exactly throughout `[-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]` (±(2^53 − 1) cents). `cents` checks incoming amounts and `inCents` checks outgoing amounts, including values decoded with `MoneyFromStruct`: that codec checks the unit and number, not this application's safe-integer invariant. For bigint or decimal inputs, validate integer-ness and range in the original representation before converting to a number; these number checks cannot recover precision already lost upstream.

The convenience `dollars` constructor intentionally accepts only whole dollars and checks the scaled result too; use `cents(425)` for $4.25. It is not a general decimal parser: multiplying arbitrary decimal numbers by 100 can introduce binary rounding errors. Parse decimal inputs exactly in your money library or with `Rational`, and choose an explicit policy for sub-cent amounts. `inDollars` is a numeric display crossing that may round, not a lossless storage or accounting boundary. Currency codes, symbols, locale formatting, decimal parsing, and rounding or allocation policies remain the application's responsibility.

**Safe integer inputs do not make float arithmetic safe accounting.** `Quantity` does not preserve an integer or safe-range invariant: sums and products can overflow the safe range, and rates can produce fractional cents. For example, pricing one meter at 200 cents per three meters produces `200 / 3` cents, which `inCents` rejects. Even a final safe-integer result cannot prove intermediate computations were exact. Use [QuantityExact](#exact-quantities) or a money library as the system of record for accounting; exact rational arithmetic avoids float rounding and width limits but still needs an application policy for rounding to payable minor units. The executable recipes and rename regressions are in `test/CustomUnitRecipes.test.ts`; `test/CustomUnitsExact.test.ts` shows an exact money-library boundary.

## Dimensionless quantities

Percentages, ratios, efficiencies, and error margins have no dimension—but a bare `number` doesn't record which scale it's on, and 0.5 versus 50 is the oldest bug in the genre. `Dimensionless` gives the pure number a unit of its own (`Unitless`, the SI unit one) and names the scale at every boundary. Values are stored as fractions, so `one` is 100%, 1,000‰, and 10,000 basis points alike:

```ts
import * as Dimensionless from "effect-units/Dimensionless";

const rate = Dimensionless.percent(2.5); // Quantity<"Unitless">

Dimensionless.inFraction(rate); // 0.025
Dimensionless.inBasisPoints(rate); // 250
Dimensionless.inPercent(Dimensionless.complement(rate)); // 97.5
```

Constructors and extractors pair up as everywhere else in the library—`fraction`, `percent`, `perMille`, `basisPoints`, `partsPerMillion`, `partsPerBillion`—alongside `zero`, `one`, and `complement` (the rest of the whole).

`Unitless` is the identity of the unit algebra, so the ordinary arithmetic already knows what to do with it: `times`, `over`, `over_`, `squared`, and `cubed` fold a dimensionless operand away instead of composing with it, and never produce a `Product` with a `Unitless` factor. Only the way _in_ needs its own operation—`ratio`, which divides two quantities in the same units and gives you the pure number rather than the `Rate<Meters, Meters>` that `per` would build:

```ts
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";

// ratio collapses same-unit division to a dimensionless quantity
const progress = Quantity.ratio(Length.meters(30), Length.kilometers(1));
Dimensionless.inPercent(progress); // 3

// times and over scale without leaving the units
const remaining = Quantity.times(
  Length.kilometers(1),
  Dimensionless.complement(progress),
); // a Length — 970 meters

Quantity.over(remaining, Dimensionless.percent(50)); // a Length — 1940 meters
Quantity.times(Length.meters(2), Length.meters(3)); // still an Area — nothing folded away
```

Either argument may be the dimensionless one, and two dimensionless factors compose into a third, since the result's units are whatever the scaled quantity started with—`Unitless` included. Because that result is a quantity rather than a number, it keeps everything quantities have: `Equal`/`Hash`, the comparison combinators, and the `{ unit: "Unitless", value }` wire format.

The one place to be careful is code generic in its units: with `U2` still a type variable, the compiler picks the general overload even when `U2` is later instantiated with `Unitless`, so the result is typed `Product<U1, U2>` while the runtime folds. The type overstates the structure, but the value stays coherent—peeling such a product back apart with `over` or `over_` undoes the fold and lands on the `Unitless` the type promised, rather than reaching for a factor the unit tree doesn't have. Keep units precise and the two agree. (A `Unit.custom("Unitless")` is a different unit entirely—a custom leaf, encoded `"[Unitless]"`—and is never folded away.)

`DimensionlessExact` is the exact twin. Every scale here is a power of ten, so `percent` is exactly 1/100, and a third of a whole stays 1/3 instead of 0.3333333333333333—which matters as soon as a percentage is applied to money (see [Exact quantities](#exact-quantities) below).

## Exact quantities

`QuantityExact` is the exact interpreter of the same unit algebra: the value is a `Rational` (an arbitrary-precision reduced fraction of bigints), so sums, products, and—crucially—rates lose nothing. `$2 per 3 meters` _is_ 200/3 cents per meter, and applying that rate to 3 meters recovers exactly $2:

```ts
import * as LengthExact from "effect-units/LengthExact";
import * as QuantityExact from "effect-units/QuantityExact";
import * as Rational from "effect-units/Rational";
import * as Unit from "effect-units/Unit";

const Usd = Unit.custom("USD");
const cents = (r: Rational.Rational) => QuantityExact.make(Usd, r);

const rate = QuantityExact.perUnsafe(
  cents(Rational.makeUnsafe(200n)),
  LengthExact.meters(Rational.makeUnsafe(3n)),
); // exactly 200/3 cents per meter

const cost = QuantityExact.at(
  rate,
  LengthExact.meters(Rational.makeUnsafe(3n)),
);
// exactly 200 cents—Equal.equals, not isCloseTo
```

Because ℚ has no infinities or NaN, partiality lives in the types instead of sentinel values: `per`, `at_`, `over`, `over_`, `divide`, and `Rational.reciprocal` return `Option` (`Option.none()` exactly when the divisor is zero), each with a `*Unsafe` twin that throws. Everything else—`sum`, `subtract`, `multiply`, `times`, `squared`, `cubed`, `at`, `for_`, comparisons—is total and exact. `equals` is decidable, and quantities are safe `HashMap` keys with no NaN or -0 caveats.

Rounding happens only at explicitly parameterized boundaries:

- `QuantityExact.fromQuantity` (float → exact) is **lossless**—every finite double is a dyadic rational; NaN/±Infinity give `Option.none()`.
- `QuantityExact.toQuantity` (exact → float) is **one correct rounding**.
- `Rational.toBigDecimal({ scale, mode })` and `Rational.round({ mode })` name their rounding at the call site, using `effect/BigDecimal`'s `RoundingMode` vocabulary—the right way out to a money library like dinero.js (see `test/CustomUnitsExact.test.ts`).
- `DurationExact` converts to and from `effect/Duration` exactly (nanosecond bigints are rationals) and rounds explicitly for millisecond-resolution `DateTime`.

The wire format is `{ unit, value }` with the value as a canonical fraction string (`"200/3"`, `"3"`)—exact on the wire, no width ceiling. The cost of exactness is that values grow: every operation reduces by gcd, but sums over unrelated denominators genuinely accumulate size, and rational arithmetic is slower than floats. Use `Quantity` for measurement and simulation; use `QuantityExact` where a lost cent (or a lost nanosecond) is a bug.

## Numbers, precision, and equality

The library is two-track: `Quantity` values are plain 64-bit floats (as in `elm-units`) with measurement semantics, and `QuantityExact` values are arbitrary-precision rationals with accounting/algebraic semantics. The two tracks agree at every conversion factor: each float factor is the correctly rounded float of its exact defining rational, asserted bit-for-bit against the exact modules in the test suite. `Quantity` uses Effect's `BigDecimal` for decimal boundaries and `Rational` for grid generation, but its ordinary arithmetic remains number-based. Where the tracks differ is _arithmetic on runtime values_: the float `Temperature.degreesFahrenheit` rounds at every operation, as any float affine map must, while `TemperatureExact` is exact.

On the float track, arithmetic follows IEEE 754 semantics: division by zero yields ±Infinity, invalid operations yield NaN, and every operation carries ordinary float rounding (~15-16 significant digits). Check results with `Quantity.isNaN`, `isInfinite`, and `isFinite`.

Equality is two-tier:

- `Equal.equals`/`Quantity.equals` is **exact**—identical value (NaN equals itself; -0 is normalized to 0) and structurally equal units. This is identity, suitable for `HashMap` keys, not for comparing computed measurements.
- `Quantity.equalsWithin(a, b, tolerance)` is the domain-level comparison—the tolerance is itself a quantity in the same units, e.g. `Quantity.equalsWithin(a, b, Length.millimeters(1))`. Identical values—including two equal infinities—are equal within any tolerance; NaN is never equal to anything.
- `Quantity.equalsWithinRelative(a, b, tolerance)` compares two measurements against a unitless relative tolerance, e.g. `Quantity.equalsWithinRelative(a, b, Dimensionless.percent(1))`. It divides their absolute difference by their mean magnitude, with two zeroes considered equal. Identical infinities are equal; NaN and unequal infinities are not.

The ordering predicates (`isLessThan`, `isGreaterThan`, …) follow IEEE NaN semantics: any comparison involving NaN is false. `min` and `max` propagate NaN deterministically, like `Math.min`/`Math.max`.

While in-memory arithmetic produces NaN and ±Infinity freely, the wire format does not admit them: schemas reject non-finite values at encode (where JSON would silently turn them into `null`) and at decode.
