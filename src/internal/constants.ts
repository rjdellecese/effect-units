import * as BigDecimal from "effect/BigDecimal";

/**
 * π to 100 decimal places (truncated).
 *
 * This is the canonical π used for every π-derived conversion factor in the
 * library (degrees, turns, parsecs, spats, ...). Consuming modules compute
 * their derived factors from it once at module load and use them symmetrically
 * (multiply on the way in, divide on the way out), so conversions roundtrip
 * exactly even though π itself is necessarily approximated.
 */
export const pi = BigDecimal.unsafeFromString(
  "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
);
