import * as Schema from "effect/Schema";

export const BaseUnit = Schema.Literal("Meters", "Grams");

export type BaseUnit = typeof BaseUnit.Type;
