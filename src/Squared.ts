import * as BigDecimal from "effect/BigDecimal";

import * as BaseUnit from "./BaseUnit";
import * as Product from "./Product";

export type Squared<U extends BaseUnit.BaseUnit> = Product.Product<U, U>;

export const make = <U extends BaseUnit.BaseUnit>(
  unit: U,
  value: BigDecimal.BigDecimal,
): Squared<U> => Product.make(unit, unit, value);
