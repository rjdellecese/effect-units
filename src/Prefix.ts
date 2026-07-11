import * as BigDecimal from "effect/BigDecimal";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

export const Prefix = Schema.Literal(
  "Quetta",
  "Ronna",
  "Yotta",
  "Zetta",
  "Exa",
  "Peta",
  "Tera",
  "Giga",
  "Mega",
  "Kilo",
  "Hecto",
  "Deca",
  "Deci",
  "Centi",
  "Milli",
  "Micro",
  "Nano",
  "Pico",
  "Femto",
  "Atto",
  "Zepto",
  "Yocto",
  "Ronto",
  "Quecto",
);

export type Prefix = typeof Prefix.Type;

const base10Exponent = (prefix: Prefix) =>
  Match.value(prefix).pipe(
    (matcher) =>
      matcher.pipe(
        Match.when("Quetta", () => 30n),
        Match.when("Ronna", () => 27n),
        Match.when("Yotta", () => 24n),
        Match.when("Zetta", () => 21n),
        Match.when("Exa", () => 18n),
        Match.when("Peta", () => 15n),
        Match.when("Tera", () => 12n),
        Match.when("Giga", () => 9n),
        Match.when("Mega", () => 6n),
        Match.when("Kilo", () => 3n),
        Match.when("Hecto", () => 2n),
        Match.when("Deca", () => 1n),
      ),
    (matcher) =>
      matcher.pipe(
        Match.when("Deci", () => -1n),
        Match.when("Centi", () => -2n),
        Match.when("Milli", () => -3n),
        Match.when("Micro", () => -6n),
        Match.when("Nano", () => -9n),
        Match.when("Pico", () => -12n),
        Match.when("Femto", () => -15n),
        Match.when("Atto", () => -18n),
        Match.when("Zepto", () => -21n),
        Match.when("Yocto", () => -24n),
        Match.when("Ronto", () => -27n),
        Match.when("Quecto", () => -30n),
      ),
    Match.exhaustive,
  );

/** `10^exponent` as a `BigDecimal`, for SI prefix conversion. */
const base10Power = (exponent: bigint): BigDecimal.BigDecimal =>
  exponent >= 0n
    ? BigDecimal.fromBigInt(10n ** exponent)
    : BigDecimal.make(1n, Number(-exponent));

export const toBase: {
  (value: BigDecimal.BigDecimal): (prefix: Prefix) => BigDecimal.BigDecimal;
  (prefix: Prefix, value: BigDecimal.BigDecimal): BigDecimal.BigDecimal;
} = Function.dual(
  2,
  (prefix: Prefix, value: BigDecimal.BigDecimal): BigDecimal.BigDecimal =>
    BigDecimal.multiply(value, base10Power(base10Exponent(prefix))),
);

export const toPrefixed: {
  (value: BigDecimal.BigDecimal): (prefix: Prefix) => BigDecimal.BigDecimal;
  (prefix: Prefix, value: BigDecimal.BigDecimal): BigDecimal.BigDecimal;
} = Function.dual(
  2,
  (prefix: Prefix, value: BigDecimal.BigDecimal): BigDecimal.BigDecimal =>
    BigDecimal.multiply(value, base10Power(-base10Exponent(prefix))),
);
