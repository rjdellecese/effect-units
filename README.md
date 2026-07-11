# effect-units

Typed quantities and unit conversions for [Effect](https://effect.website).

Extracted from [globecommerce](https://github.com/GlobeCommerce/globecommerce)'s `@globecommerce/units` package.

## Install

```bash
pnpm add effect-units effect
```

Private GitHub install until published:

```bash
pnpm add github:rjdellecese/effect-units#main
```

## Modules

| Module | Role |
| --- | --- |
| `effect-units/Quantity` | Typed quantity values with arithmetic |
| `effect-units/Length` | Length constructors / converters (metric + imperial) |
| `effect-units/Mass` | Mass constructors / converters (metric + imperial) |
| `effect-units/Prefix` | SI prefixes |
| `effect-units/Product` / `Squared` | Product of two base units |
| `effect-units/BaseUnit` | `"Meters"` \| `"Grams"` |

## Example

```ts
import * as BigDecimal from "effect/BigDecimal";
import * as Length from "effect-units/Length";
import * as Quantity from "effect-units/Quantity";

const height = Length.centimeters(BigDecimal.unsafeFromNumber(180));
const inInches = Length.inInches(height);

const area = Quantity.multiply(height, height); // Squared<"Meters">
```

## Scripts

```bash
pnpm install
pnpm test
pnpm build
```
